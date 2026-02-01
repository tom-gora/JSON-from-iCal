#!/usr/bin/env bash

# This script generates fresh test .ics files with dates relative to "now"
# to ensure consistent testing environments.

# Get relative dates
YESTERDAY=$(date -d "yesterday" +%Y%m%d)
TODAY=$(date +%Y%m%d)
TOMORROW=$(date -d "tomorrow" +%Y%m%d)
PLUS_2D=$(date -d "+2 days" +%Y%m%d)
PLUS_3D=$(date -d "+3 days" +%Y%m%d)
PLUS_4D=$(date -d "+4 days" +%Y%m%d)
PLUS_5D=$(date -d "+5 days" +%Y%m%d)
PLUS_10D=$(date -d "+10 days" +%Y%m%d)

CAL_DIR="$(dirname "$0")/calendars"
mkdir -p "$CAL_DIR"

# 1. Generate calendar.ics
cat <<EOF > "$CAL_DIR/calendar.ics"
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//tom-gora//cal-event-notifier//EN
BEGIN:VEVENT
UID:past-event-1
DTSTART:20260120T100000
DTEND:20260120T110000
SUMMARY:Past Event (Should be filtered)
END:VEVENT
BEGIN:VEVENT
UID:ongoing-event-2
DTSTART:${YESTERDAY}T100000
DTEND:${TOMORROW}T100000
SUMMARY:Ongoing Event
DESCRIPTION:This event started yesterday.
X-APPLE-STRUCTURED-LOCATION;VALUE=URI;X-APPLE-RADIUS=70.59752765345714;X-TITLE="Work":geo:52.229676,21.012229
END:VEVENT
BEGIN:VEVENT
UID:today-event-3
DTSTART:${TODAY}T140000
DTEND:${TODAY}T150000
SUMMARY:Today Event
X-APPLE-TRAVEL-ADVISORY:TRUE
END:VEVENT
BEGIN:VEVENT
UID:tomorrow-event-4
DTSTART:${TOMORROW}T090000
DTEND:${TOMORROW}T100000
SUMMARY:Tomorrow Event
END:VEVENT
BEGIN:VEVENT
UID:future-in-window-5
DTSTART:${PLUS_3D}T120000
DTEND:${PLUS_3D}T130000
SUMMARY:Future In Window
END:VEVENT
BEGIN:VEVENT
UID:future-out-window-6
DTSTART:${PLUS_10D}T120000
DTEND:${PLUS_10D}T130000
SUMMARY:Future Out Of Window
END:VEVENT
BEGIN:VEVENT
UID:all-day-today-7
DTSTART;VALUE=DATE:${TODAY}
DTEND;VALUE=DATE:${TOMORROW}
SUMMARY:All Day Today
END:VEVENT
END:VCALENDAR
EOF

# 2. Generate birthdays.ics
cat <<EOF > "$CAL_DIR/birthdays.ics"
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//tom-gora//cal-event-notifier//EN
BEGIN:VEVENT
UID:bday-alice
DTSTART;VALUE=DATE:${TODAY}
DTEND;VALUE=DATE:${TOMORROW}
SUMMARY:Alice's Birthday
END:VEVENT
BEGIN:VEVENT
UID:bday-bob
DTSTART;VALUE=DATE:${TOMORROW}
DTEND;VALUE=DATE:${PLUS_2D}
SUMMARY:Bob's Birthday
END:VEVENT
BEGIN:VEVENT
UID:bday-charlie
DTSTART;VALUE=DATE:${PLUS_2D}
DTEND;VALUE=DATE:${PLUS_3D}
SUMMARY:Charlie's Birthday
END:VEVENT
BEGIN:VEVENT
UID:bday-david
DTSTART;VALUE=DATE:${PLUS_3D}
DTEND;VALUE=DATE:${PLUS_4D}
SUMMARY:David's Birthday
END:VEVENT
BEGIN:VEVENT
UID:bday-eve
DTSTART;VALUE=DATE:${PLUS_4D}
DTEND;VALUE=DATE:${PLUS_5D}
SUMMARY:Eve's Birthday
END:VEVENT
END:VCALENDAR
EOF

chmod +x "$0"
echo "Test data prepared successfully in $CAL_DIR"
