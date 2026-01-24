package common

const (
	AppBy      = "JSON-from-iCal by github.com/tom-gora"
	AppVersion = "1.0.0"
)

// Defaults
const (
	DefConfigPath   = ""
	DefTargetFile   = ""
	DefLimit        = 0
	DefVerbose      = false
	DefUpcomingDays = 7
	DefDateTemplate = "[ DDD ] DD MMM YYYY"
)

type ExitCode int

const (
	ExitNorm ExitCode = iota
	ExitVer
)

func (ec ExitCode) Int() int {
	return int(ec)
}
