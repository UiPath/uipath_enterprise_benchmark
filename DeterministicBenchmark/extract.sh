#!/bin/bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Export tasks JSON using the TypeScript script
npm --prefix "$DIR" run export:tasks