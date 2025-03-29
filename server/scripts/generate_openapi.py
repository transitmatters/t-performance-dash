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
from pathlib import Path


def generate_openapi_json(output_path="openapi.json"):
    """
    Generate OpenAPI JSON file from the application.

    Args:
        output_path: Path where to save the OpenAPI JSON file

    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Import the spec from the application
        from app import spec

        # Get the OpenAPI spec as a dictionary
        openapi_spec = spec.to_dict()

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
        return True

    except Exception as e:
        print(f"❌ Error generating OpenAPI specification: {e}")
        return False


if __name__ == "__main__":
    output_path = sys.argv[1] if len(sys.argv) > 1 else "openapi.json"
    success = generate_openapi_json(output_path)
    sys.exit(0 if success else 1)
