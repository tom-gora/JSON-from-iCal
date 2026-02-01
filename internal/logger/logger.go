// Package logger
package logger

import (
	"io"
	"log"
	"os"
)

type LogType struct {
	Report *log.Logger
	Error  *log.Logger
	Warn   *log.Logger
	Info   *log.Logger
	Debug  *log.Logger
	Stats  *log.Logger
}

func (l *LogType) EnableInfo() {
	l.Info.SetOutput(os.Stderr)
}

func (l *LogType) EnableDebug() {
	l.Debug.SetOutput(os.Stderr)
}

func (l *LogType) EnableStats(file *os.File) {
	l.Stats.SetOutput(file)
}

var Log LogType

func init() {
	file := os.Stderr
	settings := log.Ldate | log.Ltime | log.Lshortfile
	Log = LogType{
		Report: log.New(file, "REPORT: ", settings),
		Error:  log.New(file, "ERROR: ", settings),
		Warn:   log.New(file, "WARNING: ", settings),
		Info:   log.New(io.Discard, "INFO: ", settings),
		Debug:  log.New(io.Discard, "DEBUG: ", settings),
		Stats:  log.New(io.Discard, "", settings),
	}
}
