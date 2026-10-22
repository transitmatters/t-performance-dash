#!/usr/bin/env python3
"""
Script to generate shell script blocks for all grouped bus routes in lines.txt.
This creates the text blocks needed for check_latest_manifests.sh and gen_manifests.sh.
"""

import csv
from pathlib import Path


def parse_lines_file(lines_file_path):
    """Parse the lines.txt file and extract grouped bus routes."""
    grouped_routes = []

    with open(lines_file_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            line_short_name = row["line_short_name"]
            line_id = row["line_id"]

            # Check if it's a bus route (starts with 'line-' and has numbers/slashes)
            if line_id.startswith("line-") and "/" in line_short_name:
                # Extract individual route numbers
                route_numbers = [r.strip() for r in line_short_name.split("/")]
                # Filter out non-numeric routes (like CT2, CT3, SL1, etc.)
                numeric_routes = [r for r in route_numbers if r.isdigit()]

                if len(numeric_routes) > 1:  # Only grouped routes with multiple numeric routes
                    grouped_routes.append(
                        {
                            "line_id": line_id,
                            "line_short_name": line_short_name,
                            "routes": numeric_routes,
                            "filename": "-".join(numeric_routes),
                        }
                    )

    return sorted(grouped_routes, key=lambda x: x["line_short_name"])


def generate_check_manifests_blocks(grouped_routes):
    """Generate shell script blocks for check_latest_manifests.sh."""
    blocks = []

    for route_group in grouped_routes:
        filename = route_group["filename"]
        routes_args = " ".join(route_group["routes"])

        block = f"""# Handle {filename} separately
poetry run python manifest.py $newfile data/output/manifests/{filename}.json --checkpoints data/input/MBTA_GTFS/checkpoints.txt -r {routes_args}
echo "Comparing old and new manifests for routes {filename}"
poetry run python compare_manifest.py ../../common/constants/bus_constants/{filename}.json data/output/manifests/{filename}.json"""

        blocks.append(block)

    return blocks


def generate_gen_manifests_blocks(grouped_routes):
    """Generate shell script blocks for gen_manifests.sh."""
    blocks = []

    for route_group in grouped_routes:
        filename = route_group["filename"]
        routes_args = " ".join(route_group["routes"])

        block = f"""# Handle {filename} separately
mkdir -p data/output/manifests/{filename}
for f in $(find data/input/ -name *.csv); do
    month=$(echo $f | cut -d/ -f4 | cut -d. -f1)
    poetry run python manifest.py $f "data/output/manifests/{filename}/{filename}_$month.json" --checkpoints "data/input/MBTA_GTFS/checkpoints.txt" -r {routes_args}
done"""

        blocks.append(block)

    return blocks


def main():
    # Path to the lines.txt file
    lines_file = Path(__file__).parent / "data/input/MBTA_GTFS/lines.txt"
    output_file = Path(__file__).parent / "data/output/grouped_routes_output.txt"

    if not lines_file.exists():
        print(f"Error: {lines_file} not found!")
        return

    # Parse the lines file
    grouped_routes = parse_lines_file(lines_file)

    # Write all output to file
    with open(output_file, "w", encoding="utf-8") as f:
        f.write("Found grouped bus routes:\n")
        for route in grouped_routes:
            f.write(f"  {route['line_short_name']} -> {route['filename']} (routes: {', '.join(route['routes'])})\n")

        f.write(f"\nTotal: {len(grouped_routes)} grouped routes\n\n")

        # Generate blocks for check_latest_manifests.sh
        f.write("=" * 80 + "\n")
        f.write("BLOCKS FOR check_latest_manifests.sh\n")
        f.write("=" * 80 + "\n")
        f.write("\n# Add these blocks at the end of check_latest_manifests.sh:\n\n")

        check_blocks = generate_check_manifests_blocks(grouped_routes)
        for i, block in enumerate(check_blocks):
            f.write(block)
            if i < len(check_blocks) - 1:
                f.write("\n\n")

        # Generate blocks for gen_manifests.sh
        f.write("\n\n\n" + "=" * 80 + "\n")
        f.write("BLOCKS FOR gen_manifests.sh\n")
        f.write("=" * 80 + "\n")
        f.write("\n# Add these blocks at the end of gen_manifests.sh:\n\n")

        gen_blocks = generate_gen_manifests_blocks(grouped_routes)
        for i, block in enumerate(gen_blocks):
            f.write(block)
            if i < len(gen_blocks) - 1:
                f.write("\n\n")

        # Generate manifest generation commands
        f.write("\n\n\n" + "=" * 80 + "\n")
        f.write("MANIFEST GENERATION COMMANDS\n")
        f.write("=" * 80 + "\n")
        f.write("\n# Run these commands to generate all grouped route manifests:\n\n")

        for route_group in grouped_routes:
            filename = route_group["filename"]
            routes_args = " ".join(route_group["routes"])

            f.write(f"# Generate manifest for {route_group['line_short_name']}\n")
            f.write(
                f"poetry run python manifest.py data/input/2024/MBTA_Bus_Arrival_Departure_Times_2024/MBTA-Bus-Arrival-Departure-Times_2024-12.csv data/output/manifests/{filename}.json --checkpoints data/input/MBTA_GTFS/checkpoints.txt -r {routes_args}\n"
            )
            f.write(
                f"cp data/output/manifests/{filename}.json ../../common/constants/bus_constants/{filename}.json\n\n"
            )

    print(f"Output written to: {output_file}")
    print(f"Found {len(grouped_routes)} grouped routes")
    print("Check the output file for all generated blocks and commands.")


if __name__ == "__main__":
    main()
