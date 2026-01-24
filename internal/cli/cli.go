// Package cli
package cli

import (
	"bufio"
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"strings"

	"github.com/fatih/color"
	"github.com/rodaine/table"
	"github.com/tom-gora/JSON-from-iCal/internal/common"
	t "github.com/tom-gora/JSON-from-iCal/internal/types"
)

func SetCtxFromConfig(ec *t.ExecutionCtx, fc t.FlagCtx) ([]string, error) {
	if fc.ConfigPath == "" {
		return []string{}, nil
	}

	ec.ConfigPath = fc.ConfigPath

	JSONBytes, err := os.ReadFile(common.PathExpandTilde(fc.ConfigPath))
	if err != nil {
		return []string{}, err
	}

	var config t.ConfigCtx
	err = json.Unmarshal(JSONBytes, &config)
	if err != nil {
		return []string{}, err
	}

	if config.UpcomingDays > 0 {
		ec.UpcomingDays = config.UpcomingDays
	}
	if config.Limit > 0 {
		ec.Limit = config.Limit
	}
	if config.TargetFile != "" {
		ec.TargetFile = config.TargetFile
	}
	if config.DateTemplate != "" {
		ec.DateTemplate = config.DateTemplate
	}
	return config.Calendars, nil
}

func GetFlagCtx() t.FlagCtx {
	ctx := t.FlagCtx{}
	flag.Usage = func() {
		out := flag.CommandLine.Output()
		fmt.Fprintf(out, "\n%s\n", color.New(color.FgCyan, color.Bold).Sprint(common.AppBy))
		fmt.Fprintf(out, "Version: %s\n\n", color.New(color.FgYellow).Sprint(common.AppVersion))
		fmt.Fprintf(out, "%s\n", color.New(color.FgHiWhite, color.Underline).Sprint("Usage:"))
		fmt.Fprintf(out, "  jfi [flags]\n\n")

		headerFmt := color.New(color.FgHiGreen, color.Bold).SprintfFunc()
		columnFmt := color.New(color.FgHiWhite).SprintfFunc()

		tbl := table.New("Flag", "Short", "Default", "Description")
		tbl.WithWriter(out)
		tbl.WithHeaderFormatter(headerFmt)
		tbl.WithFirstColumnFormatter(columnFmt)

		flags := []struct {
			long, short, def, desc string
		}{
			{"upcoming-days", "u", "7", "Number of upcoming days to include"},
			{"limit", "l", "0", "Max number of events to process (0=unlimited)"},
			{"file", "f", "stdout", "Output file (empty for priority logic)"},
			{"config", "c", "", "Path to calendars.conf"},
			{"verbose", "v", "false", "Enable verbose logging"},
			{"version", "V", "false", "Report version info"},
		}

		for _, f := range flags {
			tbl.AddRow("--"+f.long, "-"+f.short, f.def, f.desc)
		}

		tbl.Print()
		fmt.Fprintln(out)
		fmt.Fprintln(out, "Priority Logic for --file \"\":")
		fmt.Fprintln(out, "  1. $XDG_CACHE_HOME/event-notifications/out.json")
		fmt.Fprintln(out, "  2. $HOME/.cache/event-notifications/out.json")
		fmt.Fprintln(out, "  3. ./out/out.json")
	}

	flag.BoolVar(&ctx.ShowVersion, "version", false, "")
	flag.BoolVar(&ctx.ShowVersion, "V", false, "")
	flag.BoolVar(&ctx.Verbose, "verbose", false, "")
	flag.BoolVar(&ctx.Verbose, "v", false, "")
	flag.IntVar(&ctx.Limit, "limit", 0, "")
	flag.IntVar(&ctx.Limit, "l", 0, "")
	flag.IntVar(&ctx.UpcomingDays, "upcoming-days", 7, "")
	flag.IntVar(&ctx.UpcomingDays, "u", 7, "")
	flag.StringVar(&ctx.ConfigPath, "config", "", "")
	flag.StringVar(&ctx.ConfigPath, "c", "", "")

	ctx.IsFileSet = false

	// Custom flag parsing for -f to detect if it's set at all
	flag.Func("file", "Output file", func(s string) error {
		ctx.TargetFile = s
		ctx.IsFileSet = true
		return nil
	})

	flag.Func("f", "Output file", func(s string) error {
		ctx.TargetFile = s
		ctx.IsFileSet = true
		return nil
	})

	flag.Parse()

	ctx.SpecifiedFlags = make(map[string]bool)
	flag.Visit(func(f *flag.Flag) {
		ctx.SpecifiedFlags[f.Name] = true
	})

	return ctx
}

func InitCtx() t.ExecutionCtx {
	conf := t.ExecutionCtx{
		ConfigPath:   common.DefConfigPath,
		TargetFile:   common.DefTargetFile,
		Limit:        common.DefLimit,
		Verbose:      common.DefVerbose,
		UpcomingDays: common.DefUpcomingDays,
		DateTemplate: common.DefDateTemplate,
	}
	return conf
}

// TODO: More advanced config allowing at least few opts.
// func parseConfig(config Config) {}

func ParseCalendarsConfig(p string) ([]string, error) {
	file, err := os.Open(common.PathExpandTilde(p))
	if err != nil {
		return nil, err
	}
	defer file.Close()

	var uris []string
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		// Whitelist: Must be a URL or a valid local file
		isURL := strings.HasPrefix(line, "http://") || strings.HasPrefix(line, "https://")
		if isURL || common.IsValidFile(line) {
			uris = append(uris, common.PathExpandTilde(line))
		}
	}
	return uris, scanner.Err()
}
