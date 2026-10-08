const assets = {
  logo: "/assets/15781.svg",
  edit: "/assets/6bd99.svg",
  divider: "/assets/82e35.svg",
  shield: "/assets/5159c.svg",
  check: "/assets/d5c47.svg",
  star: "/assets/f11d9.svg",
  leftLaurel: "/assets/c50c3.svg",
  rightLaurel: "/assets/d4399.svg",
  zerodhaLaurel: "/assets/eefd6.svg",
  zerodha: "/assets/6eefa.svg",
}

const options = [
  {
    title: "Health Insurance",
    description: "Covers your medical bills if you are hospitalized.",
  },
  {
    title: "Term Insurance",
    description: "Your family gets 1 Crore or more in the event of your passing.",
  },
  {
    title: "I need both",
    description: "Protect your health and your family’s financial future.",
  },
  {
    title: "I’m not sure",
    description: "An advisor will help you understand your options.",
  },
]

const app = document.querySelector("#app")
const state = {
  step: 0,
  choice: "Health Insurance",
  booking: null,
  customSchedule: false,
  scheduleError: "",
  details: { name: "", email: "", phone: "" },
  attemptedDetails: false,
}

function indiaDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())
}

function nextDate(date, offset) {
  const value = new Date(`${date}T12:00:00`)
  value.setDate(value.getDate() + offset)
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`
}

function clockLabel(minutes) {
  return `${Math.floor(minutes / 60) % 12 || 12}:${String(minutes % 60).padStart(2, "0")} ${minutes < 720 ? "am" : "pm"}`
}

function bookingLabel(booking) {
  const date = new Date(`${booking.date}T12:00:00`).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })
  return `${date} · ${clockLabel(booking.minutes)}`
}

function availableSlots(date) {
  return Array.from({ length: 18 }, (_, index) => 600 + index * 30).filter(
    (minutes) =>
      new Date(
        `${date}T${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}:00+05:30`,
      ).getTime() >
      Date.now() + 30 * 60 * 1000,
  )
}

function firstBooking() {
  const today = indiaDate()
  const slots = availableSlots(today)
  return slots.length
    ? { date: today, minutes: slots[0] }
    : { date: nextDate(today, 1), minutes: 600 }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }
    return entities[character]
  })
}

function logo(showBack = false) {
  return `
    <header class="app-header">
      ${showBack ? '<button class="header-edit" type="button" data-action="back"><span aria-hidden="true">‹</span>Back</button>' : ""}
      <img alt="Ditto" class="logo" height="41" src="${assets.logo}" width="90" />
    </header>
  `
}

function progress(step) {
  return `
    <div aria-label="Step ${step} of 4" aria-valuemax="4" aria-valuemin="1" aria-valuenow="${step}" class="progress" role="progressbar">
      <span style="width: ${step * 25}%"></span>
    </div>
  `
}

function primaryButton(label, type = "button") {
  return `<button class="primary-button" type="${type}">${label}</button>`
}

function welcome() {
  return `
    <div class="screen welcome">
      ${logo()}
      <main class="welcome-main">
        <section>
          <h1>Insurance advice without the sales pressure.</h1>
          <p class="lead">Talk to an IRDAI certified advisor who explains it in your native language.</p>
        </section>
        <div class="badges">
          <span>30 min consultation</span>
          <span>Zero Cost</span>
          <span>Zero Spam</span>
        </div>
        <div class="trust-row">
          <div class="trust-item">
            <div class="laurel-rating">
              <img alt="" class="laurel left" src="${assets.leftLaurel}" />
              <span>4.9</span>
              <img alt="" class="rating-star" src="${assets.star}" />
              <img alt="" class="laurel right" src="${assets.rightLaurel}" />
            </div>
            <p>30K+ Ratings on google</p>
          </div>
          <div class="trust-item">
            <div class="zerodha-mark">
              <img alt="" class="zerodha-laurel" src="${assets.zerodhaLaurel}" />
              <img alt="Zerodha" class="zerodha-logo" src="${assets.zerodha}" />
            </div>
            <p>Backed by zerodha</p>
          </div>
        </div>
      </main>
      <div class="welcome-actions">
        <button class="primary-button" data-action="start" type="button">Get free insurance advice</button>
        <button class="secondary-button" data-action="start" type="button">Book a free call now</button>
      </div>
    </div>
  `
}

function choiceScreen() {
  return `
    <div class="screen">
      ${logo(true)}
      <main class="flow-main">
        ${progress(1)}
        <section class="intro">
          <h1>What do you need help with ?</h1>
          <p class="lead">Start with one simple choice and we&apos;ll take you to the most effective insurance according to your needs</p>
        </section>
        <div class="choice-list">
          ${options
            .map(
              (option) => `
                <button class="choice-card" data-choice="${escapeHtml(option.title)}" type="button">
                  <strong>${option.title}</strong>
                  <span>${option.description}</span>
                </button>
              `,
            )
            .join("")}
        </div>
      </main>
    </div>
  `
}

function scheduleScreen() {
  const earliest = firstBooking()
  const tomorrow = { date: nextDate(indiaDate(), 1), minutes: 600 }
  const scheduleOptions = [
    { value: "earliest", title: bookingLabel(earliest), booking: earliest, quickest: true },
    ...(earliest.date === tomorrow.date && earliest.minutes === tomorrow.minutes
      ? []
      : [{ value: "tomorrow", title: bookingLabel(tomorrow), booking: tomorrow, quickest: false }]),
    { value: "custom", title: "Choose another time", booking: null, quickest: false },
  ]
  const description =
    state.choice === "I’m not sure"
      ? "your insurance needs"
      : state.choice === "I need both"
        ? "health and term insurance"
        : state.choice.toLowerCase()
  const slots = availableSlots(state.booking.date)
  const dateMin = indiaDate()
  const dateMax = nextDate(dateMin, 30)

  return `
    <div class="screen">
      ${logo(true)}
      <main class="flow-main has-sticky-actions">
        ${progress(2)}
        <section class="intro schedule-intro">
          <h1>Choose a time that works for you</h1>
          <p class="lead">A free 30-minute call about ${description}. All times are in India Standard Time (IST).</p>
        </section>
        <div class="schedule-list">
          ${scheduleOptions
            .map((option) => {
              const selected = option.booking
                ? !state.customSchedule &&
                  state.booking.date === option.booking.date &&
                  state.booking.minutes === option.booking.minutes
                : state.customSchedule
              return `
                <button aria-pressed="${selected}" class="schedule-card${selected ? " selected" : ""}" data-schedule="${option.value}" type="button">
                  <span>
                    ${option.quickest ? "<small>Free consultation</small>" : ""}
                    <strong>${option.title}</strong>
                  </span>
                  ${option.quickest ? "<em>Quickest</em>" : ""}
                </button>
              `
            })
            .join("")}
        </div>
        ${
          state.customSchedule
            ? `
              <section aria-label="Choose date and time" class="time-picker">
                <label for="booking-date">Choose a date</label>
                <input id="booking-date" type="date" value="${state.booking.date}" min="${dateMin}" max="${dateMax}" />
                <p>Available start times · IST</p>
                <div class="time-grid">
                  ${slots
                    .map(
                      (minutes) => `
                        <button aria-pressed="${state.booking.minutes === minutes}" class="${state.booking.minutes === minutes ? "active" : ""}" data-time="${minutes}" type="button">${clockLabel(minutes)}</button>
                      `,
                    )
                    .join("")}
                </div>
                ${slots.length ? "" : '<p role="status">No more slots today. Please choose another date.</p>'}
              </section>
            `
            : ""
        }
        <p class="schedule-note">Selected: ${state.booking.minutes >= 0 ? bookingLabel(state.booking) : "Choose an available time"}</p>
        ${state.scheduleError ? `<p class="field-error" role="alert">${state.scheduleError}</p>` : ""}
      </main>
      <div class="sticky-actions">
        <button class="primary-button" data-action="confirm-booking" type="button">Confirm Schedule</button>
        <div class="or-divider"><span></span>OR<span></span></div>
        <button class="whatsapp-button" data-action="whatsapp" type="button">Chat on WhatsApp Instead</button>
      </div>
    </div>
  `
}

function detailsScreen() {
  const nameValid = state.details.name.trim().length > 1
  const emailValid = /^\S+@\S+\.\S+$/.test(state.details.email)
  const phoneValid = /^(?:\+91[\s-]?)?[6-9]\d{9}$/.test(
    state.details.phone.replace(/[\s-]/g, ""),
  )
  const fieldsValid = nameValid && emailValid && phoneValid
  const validationMessage = [
    !nameValid ? "Enter your name (at least 2 characters)." : "",
    !emailValid ? "Enter a valid email address." : "",
    !phoneValid
      ? "Enter a valid 10-digit Indian mobile number, optionally with +91."
      : "",
  ]
    .filter(Boolean)
    .join(" ")

  return `
    <div class="screen">
      ${logo(true)}
      <main class="flow-main details-main">
        ${progress(3)}
        <h1 class="details-title">Almost Done</h1>
        <div class="summary-card">
          <div>
            <small>Our advisor will call you</small>
            <strong>${escapeHtml(bookingLabel(state.booking).replace(" · ", "  ·  "))}</strong>
          </div>
          <img alt="" class="vertical-divider" src="${assets.divider}" />
          <button data-action="back" type="button"><img alt="" height="20" src="${assets.edit}" width="20" />Edit</button>
        </div>
        <form class="details-form" novalidate>
          <p>Please fill below details</p>
          <label class="${state.attemptedDetails && !nameValid ? "invalid" : ""}">
            <span>Name*</span>
            <input aria-invalid="${state.attemptedDetails && !nameValid}" autocomplete="name" name="name" placeholder="Name*" value="${escapeHtml(state.details.name)}" />
          </label>
          <label class="${state.attemptedDetails && !emailValid ? "invalid" : ""}">
            <span>Email*</span>
            <input aria-invalid="${state.attemptedDetails && !emailValid}" autocomplete="email" name="email" placeholder="Email*" type="email" value="${escapeHtml(state.details.email)}" />
          </label>
          <label class="${state.attemptedDetails && !phoneValid ? "invalid" : ""}">
            <span>Phone Number*</span>
            <input aria-invalid="${state.attemptedDetails && !phoneValid}" autocomplete="tel" inputmode="tel" name="phone" placeholder="Phone Number*" value="${escapeHtml(state.details.phone)}" />
          </label>
          ${state.attemptedDetails && !fieldsValid ? `<p class="field-error" role="alert">${validationMessage}</p>` : ""}
          <div class="privacy-note">
            <img alt="" height="29" src="${assets.shield}" width="27" />
            <span>We promise a strictly spam-free service. We will not call you unless you ask us to do so.</span>
          </div>
          <div class="form-action">${primaryButton("Confirm Schedule", "submit")}</div>
        </form>
      </main>
    </div>
  `
}

function confirmationScreen() {
  const firstName = state.details.name.trim().split(" ")[0] || "Omkar"
  const displayChoice =
    state.choice === "I need both"
      ? "Health & Term Insurance"
      : state.choice === "I’m not sure"
        ? "Insurance advice"
        : state.choice

  return `
    <div class="screen">
      ${logo(true)}
      <main class="flow-main confirmation-main">
        ${progress(4)}
        <img alt="" class="success-check" src="${assets.check}" />
        <h1>Booking Confirmed</h1>
        <div class="booking-card">
          <strong>${displayChoice}</strong>
          <div><span>${bookingLabel(state.booking)} – ${clockLabel(state.booking.minutes + 30)} IST</span></div>
          <p>A free 30-minute consultation to discuss your insurance needs with a Ditto advisor.</p>
        </div>
        <div class="thank-you">
          <p>Thank you ${escapeHtml(firstName)}, for booking a call with us.<br />This is a prototype booking. No call or email has been scheduled.</p>
          <p>In the meantime you can also have a look at</p>
        </div>
        <div class="confirmation-actions">
          <button data-action="calendar" type="button">Add to calendar</button>
          <button data-action="restart" type="button">Back to home</button>
        </div>
      </main>
    </div>
  `
}

function render() {
  const screens = [welcome, choiceScreen, scheduleScreen, detailsScreen, confirmationScreen]
  const stage = document.createElement("div")
  stage.className = "transition-stage"
  stage.innerHTML = screens[state.step]()
  app.replaceChildren(stage)
}

function goTo(step) {
  state.step = step
  render()
}

function downloadCalendar() {
  const start = new Date(
    `${state.booking.date}T${String(Math.floor(state.booking.minutes / 60)).padStart(2, "0")}:${String(state.booking.minutes % 60).padStart(2, "0")}:00+05:30`,
  )
  const stamp = (date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
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
  const url = URL.createObjectURL(new Blob([content], { type: "text/calendar" }))
  const link = document.createElement("a")
  link.href = url
  link.download = "ditto-consultation.ics"
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

app.addEventListener("click", (event) => {
  const target = event.target.closest("button")
  if (!target) return

  if (target.dataset.choice) {
    state.choice = target.dataset.choice
    state.customSchedule = false
    state.scheduleError = ""
    goTo(2)
    return
  }

  if (target.dataset.schedule) {
    state.scheduleError = ""
    state.customSchedule = target.dataset.schedule === "custom"
    if (target.dataset.schedule === "earliest") state.booking = firstBooking()
    if (target.dataset.schedule === "tomorrow") {
      state.booking = { date: nextDate(indiaDate(), 1), minutes: 600 }
    }
    render()
    return
  }

  if (target.dataset.time) {
    state.booking.minutes = Number(target.dataset.time)
    state.scheduleError = ""
    render()
    return
  }

  switch (target.dataset.action) {
    case "start":
      goTo(1)
      break
    case "back":
      goTo(Math.max(0, state.step - 1))
      break
    case "confirm-booking":
      if (availableSlots(state.booking.date).includes(state.booking.minutes)) {
        state.attemptedDetails = false
        goTo(3)
      } else {
        state.customSchedule = true
        state.scheduleError = "That time is no longer available. Please choose a new slot."
        render()
      }
      break
    case "whatsapp":
      window.open(
        `https://wa.me/?text=${encodeURIComponent(`Hi, I'd like free advice about ${state.choice.toLowerCase()}.`)}`,
        "_blank",
        "noopener,noreferrer",
      )
      break
    case "calendar":
      downloadCalendar()
      break
    case "restart":
      state.details = { name: "", email: "", phone: "" }
      state.choice = "Health Insurance"
      state.booking = firstBooking()
      state.customSchedule = false
      state.attemptedDetails = false
      goTo(0)
      break
  }
})

app.addEventListener("input", (event) => {
  const field = event.target
  if (field.name in state.details) {
    state.details[field.name] = field.value
  }
})

app.addEventListener("change", (event) => {
  if (event.target.id !== "booking-date") return
  const date = event.target.value
  if (date < indiaDate() || date > nextDate(indiaDate(), 30)) return
  state.booking = { date, minutes: availableSlots(date)[0] ?? -1 }
  state.scheduleError = ""
  render()
})

app.addEventListener("submit", (event) => {
  if (!event.target.matches(".details-form")) return
  event.preventDefault()
  state.attemptedDetails = true
  const nameValid = state.details.name.trim().length > 1
  const emailValid = /^\S+@\S+\.\S+$/.test(state.details.email)
  const phoneValid = /^(?:\+91[\s-]?)?[6-9]\d{9}$/.test(
    state.details.phone.replace(/[\s-]/g, ""),
  )
  if (nameValid && emailValid && phoneValid) {
    goTo(4)
  } else {
    render()
  }
})

state.booking = firstBooking()
render()
