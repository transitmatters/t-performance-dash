#!/usr/bin/env python
"""
Generate OpenAPI specification from the application.

This script creates a static openapi.json file by extracting the
API specification from the application definition. This can be useful for:

1. Version controlling the API specification
2. Importing into tools like Swagger UI, Postman, etc.
3. Generating client libraries in other languages
4. CI/CD processes that need the API specification

Usage:
    python generate_openapi.py [output_file]

Arguments:
    output_file - Optional path where to save the OpenAPI JSON file.
                  Defaults to "./openapi.json"
"""

import json
import sys
import os
import traceback
from pathlib import Path


def extract_nested_schemas(openapi_spec):
    """
    Extract nested schemas from $defs sections and move them to the top level
    of components.schemas to ensure they can be properly referenced.

    Args:
        openapi_spec: The OpenAPI specification dictionary

    Returns:
        dict: The modified OpenAPI specification
    """
    try:
        # Make sure components and schemas exist
        if "components" not in openapi_spec:
            openapi_spec["components"] = {}
        if "schemas" not in openapi_spec["components"]:
            openapi_spec["components"]["schemas"] = {}

        # Process all schemas to find $defs sections
        schemas = openapi_spec["components"]["schemas"]
        schemas_to_process = list(schemas.items())

        nested_defs_found = 0
        for schema_name, schema in schemas_to_process:
            if "$defs" in schema:
                # Move each definition to the top level
                for def_name, def_schema in schema["$defs"].items():
                    if def_name not in schemas:
                        schemas[def_name] = def_schema
                        nested_defs_found += 1

                # Remove the $defs section from the original schema
                del schema["$defs"]

                # Update references in the schema itself
                update_refs_in_schema(schema, schema_name)

        # Update all references in all schemas to point to the top level
        for schema_name, schema in schemas.items():
            update_refs_in_schema(schema, None)

        if nested_defs_found > 0:
            print(f"ℹ️ Found and fixed {nested_defs_found} nested schema definitions")

        return openapi_spec
    except Exception as e:
        print(f"⚠️ Warning: Error in extract_nested_schemas: {e}")
        traceback.print_exc()
        return openapi_spec


def update_refs_in_schema(obj, parent_schema_name):
    """
    Update $ref paths in a schema to point to the correct location.

    Args:
        obj: The object (schema or part of schema) to update
        parent_schema_name: The name of the parent schema
    """
    try:
        if isinstance(obj, dict):
            # Check if this is a reference
            if "$ref" in obj and parent_schema_name:
                # If reference points to a local definition, update it
                if obj["$ref"].startswith(f"#/components/schemas/{parent_schema_name}/$defs/"):
                    def_name = obj["$ref"].split("/")[-1]
                    obj["$ref"] = f"#/components/schemas/{def_name}"

            # Recursively process all dictionary values
            for key, value in list(obj.items()):
                update_refs_in_schema(value, parent_schema_name)

        elif isinstance(obj, list):
            # Recursively process all list items
            for item in obj:
                update_refs_in_schema(item, parent_schema_name)
    except Exception as e:
        print(f"⚠️ Warning: Error in update_refs_in_schema: {e}")
        traceback.print_exc()


def generate_openapi_json(output_path="openapi.json"):
    """
    Generate OpenAPI JSON file from the application.

    Args:
        output_path: Path where to save the OpenAPI JSON file

    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Try to import the spec from the application
        # This might fail if not run in the correct environment
        try:
            # Import the spec from the application
            from app import spec

            print("✅ Successfully imported spec from app")

            # Get the OpenAPI spec as a dictionary
            openapi_spec = spec.to_dict()
        except ImportError:
            # Fallback: try to load from existing file if available
            if os.path.exists(output_path):
                print(f"ℹ️ Could not import from app, loading from {output_path} instead")
                with open(output_path, "r") as f:
                    openapi_spec = json.load(f)
            else:
                raise ImportError("Could not import spec from app and no existing openapi.json found")

        # Fix nested schemas
        print("ℹ️ Processing schema definitions...")
        openapi_spec = extract_nested_schemas(openapi_spec)

        # Ensure the directory exists
        output_dir = os.path.dirname(output_path)
        if output_dir and not os.path.exists(output_dir):
            os.makedirs(output_dir)

        # Write the spec to a file
        with open(output_path, "w") as f:
            json.dump(openapi_spec, f, indent=2)

        print(f"✅ OpenAPI specification saved to {output_path}")
        print(f"   File size: {Path(output_path).stat().st_size / 1024:.1f} KB")
        print(f"   Endpoints: {len(openapi_spec.get('paths', {}))} defined")
        print(f"   Schema definitions: {len(openapi_spec.get('components', {}).get('schemas', {}))} defined")
        return True

    except Exception as e:
        print(f"❌ Error generating OpenAPI specification: {e}")
        traceback.print_exc()
        return False


if __name__ == "__main__":
    output_path = sys.argv[1] if len(sys.argv) > 1 else "openapi.json"
    success = generate_openapi_json(output_path)
    sys.exit(0 if success else 1)
