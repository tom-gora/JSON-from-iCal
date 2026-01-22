# Agent Instructions for cal-event-notifier

This repository contains a Go-based tool for processing iCal calendars and generating JSON event notifications. 
It is designed for personal use to bridge calendar events to system notification systems.

## Build and Development Commands

### Core Commands
- **Build (via Makefile)**: `make build` (outputs to `bin/cal-event-notifier`)
- **Build (manual)**: `go build -o bin/cal-event-notifier event-processor.go`
- **Build (production)**: `go build -ldflags="-s -w" -o bin/cal-event-notifier event-processor.go`
- **Run**: `go run event-processor.go [flags]`
- **Lint**: `go vet ./...`
- **Test Emit**: `make test_emit` (runs test script with 5-day limit)
- **Tidy Dependencies**: `go mod tidy`

- **Run all tests**: `make test_all` (builds, validates JSON, checks limits, checks file output, checks lookahead window, and runs emission)
- **Unit tests**: `make test_unit` (Go internal logic tests)
- **Validation test**: `make test_validate`
- **Limit test**: `make test_limit`
- **File output test**: `make test_file`
- **Lookahead test**: `make test_lookahead`
- **Pipeline test**: `make test_pipeline`
- **Config junk test**: `make test_config`
- **Info flags test**: `make test_info`
- **Emit test**: `make test_emit`
- **Go tests**: `go test ./...`


## Code Style & Guidelines

### 1. General Go Standards
- Strictly adhere to `gofmt` for formatting.
- Follow standard Go naming conventions: camelCase for private members, PascalCase for public members (though this is a `package main` project).
- Use descriptive but concise variable names (e.g., `rc` for `ReadCloser`, `err` for `error`).

### 2. Imports
- Standard library imports first, followed by a newline, then external dependencies.
- External dependencies used:
    - `github.com/arran4/golang-ical`: iCal parsing
    - `github.com/fatih/color`: CLI coloring
    - `github.com/rodaine/table`: Table formatting for help output

### 3. Error Handling
- Never ignore errors. Use `_` only when absolutely necessary and documented.
- Use `Log.Error.Printf` for non-fatal errors during loop processing.
- Use `Log.Error.Fatalf` in `main` for unrecoverable startup errors.
- Prefer returning errors from helper functions rather than logging and continuing.

### 4. Logging
- Use the custom `logType` struct defined in `event-processor.go`.
- Available levels: `Report`, `Error`, `Warn`, `Info`, `Debug`, `Stats`.
- `Info` and `Debug` are disabled by default and enabled via the `--verbose` flag.
- Output for logs should generally go to `os.Stderr`.

### 5. Naming Conventions in this Project
- **Structs**: `execConf`, `calendarEvent`, `logType`.
- **Functions**: `rawToStructEvent`, `dateStrToHuman`, `expandTilde`, `fetchSource`.
- **JSON Tags**: All fields in `calendarEvent` must have PascalCase JSON tags to match the expected consumer schema (e.g., `json:"Summary"`).

### 6. Flags and Configuration
- Use the `flag` package.
- Provide both long (`--upcoming-days`) and short (`-u`) versions of flags.
- Flags should include:
    - `-u, --upcoming-days`: Range of days to look ahead.
    - `-l, --limit`: Maximum number of events to return.
    - `-f, --file`: Target output path.
    - `-c, --config`: Path to the calendars list.
    - `-v, --verbose`: Verbose logging.

## Architectural Patterns

### 1. File Path Handling
- Always use `expandTilde` when dealing with user-provided paths to support `~/`.
- Use `filepath.Join` for cross-platform path compatibility.
- Validate local files using `isValidFile` before attempting to open them.

### 2. iCal Processing
- The `processSource` function applies a "Negative Pattern" filter to remove `X-APPLE-` prefixed properties which can cause parsing issues or clutter.
- Events are filtered based on a sliding window defined by `today` and `UpcomingDays`.
- Ongoing events (started before windowStart) are marked as `Ongoing: true` and have "Ongoing" prepended to their description.
- Date parsing in `rawToStructDate` is robust, handling `YYYYMMDD`, `YYYYMMDDTHHMMSS`, and UTC formats with fallbacks.

### 3. Output Logic
- JSON output is minified by default for machine consumption.
- If no file is specified via `-f`, the tool prints to `stdout`.
- If `-f` is provided without a value, `resolveOutputPath` applies priority logic:
    1. `$XDG_CACHE_HOME/event-notifications/out.json`
    2. `$HOME/.cache/event-notifications/out.json`
    3. `./out/out.json`
- `safeWrite` ensures the parent directory exists (`MkdirAll`) and performs an atomic-like write via `os.WriteFile`.

### 4. Data Model (JSON Schema)
The `calendarEvent` struct maps to the following JSON fields:
- `UID`: Unique identifier from the iCal event.
- `Start` / `End`: Raw iCal date strings.
- `HumanStart` / `HumanEnd`: Formatted strings like `[ FRI ] 09 Jul 2021 @ 10:00`.
- `Summary`: Event title.
- `Location`: Event location.
- `Description`: Event description (with "Ongoing" prefix if applicable).
- `Hours`: Duration in decimal hours.
- `SubDay` / `Day` / `MultiDay`: Boolean flags based on event duration.
- `Ongoing`: Boolean flag if the event is currently in progress.

## Configuration Format
The `calendars.conf` file follows a strict **whitelist approach**:
- Only lines that are verifiable **URLs** (starting with `http://` or `https://`) or **existing local files** are processed.
- All other lines—including comments (`#`), empty lines, and malformed paths—are silently discarded.
- Tilde (`~/`) is supported in local paths.

## Script Integration
The `emit_notifications.sh` script is intended to:
1. Build the binary if it doesn't exist or is outdated.
2. Run `cal-event-notifier` with the `-c` flag pointing to `calendars.conf`.
3. Process the resulting JSON (e.g., using `jq`) and pipe it to a notification daemon (like `notify-send` or `dunst`).

## Project Structure
- `event-processor.go`: The single-file source for the Go logic.
- `go.mod` / `go.sum`: Dependency management.
- `calendars.conf`: A newline-separated list of URLs or local file paths.
- `emit_notifications.sh`: Shell script to trigger the Go binary and potentially send notifications.
- `out/`: Build artifacts and default data output.

## Maintenance Notes
- Keep the version string `AppVersion` updated.
- Maintain the header comment in `event-processor.go` documenting the project's history and forks.
- Ensure `calendars.conf` format remains simple: lines starting with `#` are comments, empty lines are ignored.

## External Rules & Context
- No `.cursorrules` or `.github/copilot-instructions.md` found.
- The project follows a "scripting" style for Go, keeping complexity low and focused on the single task of iCal to JSON conversion.

---
*This file is intended for agentic consumption. Ensure all modifications respect these established patterns.*
