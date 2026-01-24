// Package logger
package logger

import (
	"io"
	"log"
	"os"

	t "github.com/tom-gora/JSON-from-iCal/internal/types"
)

var Log t.LogType

func init() {
	file := os.Stderr
	settings := log.Ldate | log.Ltime | log.Lshortfile
	Log = t.LogType{
		Report: log.New(file, "REPORT: ", settings),
		Error:  log.New(file, "ERROR: ", settings),
		Warn:   log.New(file, "WARNING: ", settings),
		Info:   log.New(io.Discard, "INFO: ", settings),
		Debug:  log.New(io.Discard, "DEBUG: ", settings),
		Stats:  log.New(io.Discard, "", settings),
	}
}
