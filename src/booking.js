export function indiaDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",

    year: "numeric",

    month: "2-digit",

    day: "2-digit",
  }).format(new Date())
}

export function nextDate(date, offset) {
  const value = new Date(`${date}T12:00:00`)

  value.setDate(value.getDate() + offset)

  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`
}

export function clockLabel(minutes) {
  return `${Math.floor(minutes / 60) % 12 || 12}:${String(minutes % 60).padStart(2, "0")} ${
    minutes < 720 ? "am" : "pm"
  }`
}

export function bookingLabel(booking) {
  const date = new Date(`${booking.date}T12:00:00`).toLocaleDateString(
    "en-IN",
    {
      weekday: "short",

      day: "numeric",

      month: "short",
    },
  )

  return `${date} · ${clockLabel(booking.minutes)}`
}

export function availableSlots(date) {
  return Array.from({ length: 18 }, (_, index) => 600 + index * 30).filter(
    (minutes) =>
      new Date(
        `${date}T${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}:00+05:30`,
      ).getTime() >
      Date.now() + 30 * 60 * 1000,
  )
}

export function firstBooking() {
  const today = indiaDate()

  const slots = availableSlots(today)

  return slots.length
    ? { date: today, minutes: slots[0] }
    : { date: nextDate(today, 1), minutes: 600 }
}

export function downloadCalendar(booking) {
  const start = new Date(
    `${booking.date}T${String(Math.floor(booking.minutes / 60)).padStart(2, "0")}:${String(booking.minutes % 60).padStart(2, "0")}:00+05:30`,
  )

  const stamp = (date) =>
    date
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "")

  const uid =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`

  const content = [
    "BEGIN:VCALENDAR",

    "VERSION:2.0",

    "PRODID:-//Ditto Prototype//EN",

    "BEGIN:VEVENT",

    `UID:${uid}@ditto-prototype`,

    `DTSTAMP:${stamp(new Date())}`,

    `DTSTART:${stamp(start)}`,

    `DTEND:${stamp(new Date(start.getTime() + 1800000))}`,

    "SUMMARY:Ditto consultation (prototype)",

    "DESCRIPTION:Demo only. No advisor call has been scheduled.",

    "END:VEVENT",

    "END:VCALENDAR",
  ].join("\r\n")

  const url = URL.createObjectURL(
    new Blob([content], { type: "text/calendar" }),
  )

  const link = document.createElement("a")

  link.href = url

  link.download = "ditto-consultation.ics"

  link.click()

  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
