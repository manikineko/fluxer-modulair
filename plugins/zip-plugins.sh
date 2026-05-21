#!/bin/bash
# Script to zip all plugins in the plugins directory

cd "$(dirname "$0")"

for dir in */; do
    if [ -d "$dir" ] && [ "$dir" != "zips/" ]; then
        plugin_name="${dir%/}"
        echo "Zipping $plugin_name..."
        zip -r "${plugin_name}.zip" "$dir"
        echo "Created ${plugin_name}.zip"
    fi
done

echo "All plugins zipped successfully!"
