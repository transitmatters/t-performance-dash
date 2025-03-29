#!/usr/bin/env python
"""
Generate OpenAPI specification from the application.
This script creates a static openapi.json file by extracting the
API specification from the application.
"""
import json
import sys


def generate_openapi_json(output_path="openapi.json"):
    """Generate OpenAPI JSON file from the application."""
    # Import the app and spec
    from app import spec

    # Get the OpenAPI spec as a dictionary
    openapi_spec = spec.to_dict()

    # Write the spec to a file
    with open(output_path, "w") as f:
        json.dump(openapi_spec, f, indent=2)

    print(f"OpenAPI specification saved to {output_path}")
    return True


if __name__ == "__main__":
    output_path = sys.argv[1] if len(sys.argv) > 1 else "openapi.json"
    generate_openapi_json(output_path)
