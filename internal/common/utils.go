// Package common
package common

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

func ResolveOutputPath(p string) string {
	if p != "" {
		return p
	}

	// Priority Logic
	xdgCache := os.Getenv("XDG_CACHE_HOME")
	if xdgCache != "" {
		return filepath.Join(xdgCache, "event-notifications", "out.json")
	}

	home, err := os.UserHomeDir()
	if err == nil {
		return filepath.Join(home, ".cache", "event-notifications", "out.json")
	}

	return filepath.Join(".", "out", "out.json")
}

func CleanOldJSONFiles(dir string) {
	files, err := filepath.Glob(filepath.Join(dir, "out.json"))
	if err != nil {
		return
	}
	for _, f := range files {
		os.Remove(f)
	}
}

func SafeWrite(p string, data []byte) error {
	dir := filepath.Dir(p)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return err
	}

	// Clean up old JSON files in the destination directory to avoid mixing with old multi-file output
	CleanOldJSONFiles(dir)

	info, err := os.Stat(p)
	if err == nil {
		if info.IsDir() {
			return fmt.Errorf("target path is a directory: %s", p)
		}
	}

	return os.WriteFile(p, data, 0o644)
}

func IsValidFile(p string) bool {
	info, err := os.Stat(PathExpandTilde(p))
	return err == nil && !info.IsDir()
}

func PathExpandTilde(p string) string {
	if strings.HasPrefix(p, "~/") {
		dir, err := os.UserHomeDir()
		if err != nil {
			return p
		}
		p = filepath.Join(dir, p[2:])
	}
	return p
}
