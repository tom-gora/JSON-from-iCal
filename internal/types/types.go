// Package types
package types

import (
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

type ExecutionCtx struct {
	ConfigPath   string
	TargetFile   string
	Limit        int
	Verbose      bool
	UpcomingDays int
	DateTemplate string
}

type FlagCtx struct {
	UpcomingDays   int
	Limit          int
	TargetFile     string
	IsFileSet      bool
	ConfigPath     string
	Verbose        bool
	ShowVersion    bool
	SpecifiedFlags map[string]bool
}

type ConfigCtx struct {
	Calendars    []string `json:"calendars"`
	UpcomingDays int      `json:"upcoming_days"`
	Limit        int      `json:"events_limit"`
	TargetFile   string   `json:"output_file"`
	DateTemplate string   `json:"date_template"`
}

type CalendarEvent struct {
	UID         string  `json:"UID"`
	Start       string  `json:"Start"`
	HumanStart  string  `json:"HumanStart"`
	UnixStart   int64   `json:"UnixStart"`
	End         string  `json:"End"`
	HumanEnd    string  `json:"HumanEnd"`
	UnixEnd     int64   `json:"UnixEnd"`
	ActualEnd   string  `json:"ActualEnd"`
	Summary     string  `json:"Summary"`
	Location    string  `json:"Location"`
	Description string  `json:"Description"`
	Hours       float64 `json:"Hours"`
	SubDay      bool    `json:"SubDay"`
	Day         bool    `json:"Day"`
	MultiDay    bool    `json:"MultiDay"`
	Ongoing     bool    `json:"Ongoing"`
}
