// Package fileutil
package fileutil

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

func cleanOldJSONFiles(dir string) {
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

	cleanOldJSONFiles(dir)
	info, err := os.Stat(p)
	if err == nil {
		if info.IsDir() {
			return fmt.Errorf("target path is a directory: %s", p)
		}
	}

	return os.WriteFile(p, data, 0o644)
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

func GetOutputPath(p string) string {
	if p == "stdout" || p == "" {
		return "stdout"
	}
	return PathExpandTilde(p)
}
