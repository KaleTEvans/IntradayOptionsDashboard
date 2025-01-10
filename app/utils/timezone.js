import React from "react";

export function getTimeZoneOffset() {
    const timeZoneOffsetMinutes = new Date().getTimezoneOffset();
    const timeZoneOffsetSeconds = timeZoneOffsetMinutes * 60;
    return timeZoneOffsetSeconds;
}