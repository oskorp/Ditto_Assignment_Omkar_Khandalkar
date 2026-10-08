import { useEffect, useState } from "react"
import {
  indiaDate,
  nextDate,
  clockLabel,
  bookingLabel,
  availableSlots,
  firstBooking,
  downloadCalendar,
} from "./booking.js"

const assets = {
  logo: "15781",
  edit: "6bd99",
  shield: "5159c",
  check: "d5c47",
  star: "f11d9",
  leftLaurel: "c50c3",
  rightLaurel: "d4399",
  zerodhaLaurel: "eefd6",
  zerodha: "6eefa",
}
const options = [
  ["Health Insurance", "Covers your medical bills if you are hospitalized."],
  ["Term Insurance", "Help protect your family’s financial future."],
  ["I need both", "Protect your health and your family’s financial future."],
  ["I’m not sure", "An advisor will help you understand your options."],
]
const emptyDetails = { name: "", email: "", phone: "" }
function Image({ name, ...props }) {
  return <img src={`/assets/${assets[name]}.svg`} alt="" {...props} />
}
function Header({ onBack }) {
  return (
    <header className="app-header">
      {onBack && (
        <button className="header-edit" onClick={onBack} type="button">
          <span aria-hidden="true">‹</span>Back
        </button>
      )}
      <Image name="logo" alt="Ditto" className="logo" />
    </header>
  )
}
function Progress({ step }) {
  return (
    <div
      className="progress"
      role="progressbar"
      aria-label={`Step ${step} of 4`}
      aria-valuemin={1}
      aria-valuemax={4}
      aria-valuenow={step}
    >
      <span style={{ width: `${step * 25}%` }} />
    </div>
  )
}
function Button({ children, ...props }) {
  return (
    <button type="button" className="primary-button" {...props}>
      {children}
    </button>
  )
}
function Welcome({ onStart }) {
  return (
    <>
      <main className="welcome-main">
        <section>
          <h1 tabIndex={-1}>Insurance advice without the sales pressure.</h1>
          <p className="lead">
            Talk to an IRDAI certified advisor who explains it in your native
            language.
          </p>
        </section>
        <div className="badges">
          <span>30 min consultation</span>
          <span>Zero Cost</span>
          <span>Zero Spam</span>
        </div>
        <div className="trust-row">
          <div className="trust-item">
            <div className="laurel-rating">
              <Image name="leftLaurel" className="laurel left" />
              <span>4.9</span>
              <Image name="star" className="rating-star" />
              <Image name="rightLaurel" className="laurel right" />
            </div>
            <p>30K+ ratings on Google</p>
          </div>
          <div className="trust-item">
            <div className="zerodha-mark">
              <Image name="zerodhaLaurel" className="zerodha-laurel" />
              <Image name="zerodha" alt="Zerodha" className="zerodha-logo" />
            </div>
            <p>Backed by Zerodha</p>
          </div>
        </div>
      </main>
      <div className="welcome-actions">
        <Button onClick={onStart}>Get free insurance advice</Button>
        <button className="secondary-button" onClick={onStart}>
          Book a free call now
        </button>
      </div>
    </>
  )
}
function Choice({ onChoose }) {
  return (
    <main className="flow-main">
      <Progress step={1} />
      <section className="intro">
        <h1 tabIndex={-1}>What do you need help with?</h1>
        <p className="lead">
          Choose what’s on your mind. We’ll help you understand your options.
        </p>
      </section>
      <div className="choice-list">
        {options.map(([title, description]) => (
          <button
            className="choice-card"
            key={title}
            onClick={() => onChoose(title)}
          >
            <strong>{title}</strong>
            <span>{description}</span>
          </button>
        ))}
      </div>
    </main>
  )
}
function Schedule({ choice, booking, onChange, custom, onCustom, onNext }) {
  const [error, setError] = useState("")
  const earliest = firstBooking()
  const tomorrow = { date: nextDate(indiaDate(), 1), minutes: 600 }
  const quickOptions = [earliest]
  if (earliest.date !== tomorrow.date || earliest.minutes !== tomorrow.minutes)
    quickOptions.push(tomorrow)
  const topic =
    choice === "I need both"
      ? "health and term insurance"
      : choice === "I’m not sure"
        ? "your insurance needs"
        : choice.toLowerCase()
  function confirm() {
    if (availableSlots(booking.date).includes(booking.minutes)) onNext()
    else {
      onCustom(true)
      setError("That time is no longer available. Please choose a new slot.")
    }
  }
  return (
    <>
      <main className="flow-main">
        <Progress step={2} />
        <section className="intro">
          <h1 tabIndex={-1}>Choose a time that works for you</h1>
          <p className="lead">
            A free 30-minute call about {topic}. All times are in India Standard
            Time (IST).
          </p>
        </section>
        <div className="schedule-list">
          {quickOptions.map((option, index) => {
            const selected =
              !custom &&
              booking.date === option.date &&
              booking.minutes === option.minutes
            return (
              <button
                key={bookingLabel(option)}
                aria-pressed={selected}
                className={`schedule-card ${selected ? "selected" : ""}`}
                onClick={() => {
                  onChange(option)
                  onCustom(false)
                  setError("")
                }}
              >
                <span>
                  {index === 0 && <small>Free consultation</small>}
                  <strong>{bookingLabel(option)}</strong>
                </span>
                {index === 0 && <em>Quickest</em>}
              </button>
            )
          })}
          <button
            className={`schedule-card ${custom ? "selected" : ""}`}
            aria-pressed={custom}
            onClick={() => onCustom(true)}
          >
            <strong>Choose another time</strong>
          </button>
        </div>
        {custom && (
          <section className="time-picker" aria-label="Choose date and time">
            <label htmlFor="booking-date">Choose a date</label>
            <input
              id="booking-date"
              type="date"
              min={indiaDate()}
              max={nextDate(indiaDate(), 30)}
              value={booking.date}
              onChange={(event) => {
                const date = event.target.value
                if (date >= indiaDate() && date <= nextDate(indiaDate(), 30)) {
                  onChange({ date, minutes: availableSlots(date)[0] ?? -1 })
                  setError("")
                }
              }}
            />
            <p>Available start times · IST</p>
            <div className="time-grid">
              {availableSlots(booking.date).map((minutes) => (
                <button
                  key={minutes}
                  aria-pressed={booking.minutes === minutes}
                  className={booking.minutes === minutes ? "active" : ""}
                  onClick={() => {
                    onChange({ ...booking, minutes })
                    setError("")
                  }}
                >
                  {clockLabel(minutes)}
                </button>
              ))}
            </div>
            {!availableSlots(booking.date).length && (
              <p role="status">
                No more slots today. Please choose another date.
              </p>
            )}
          </section>
        )}
        <p className="schedule-note">
          Selected:{" "}
          {booking.minutes >= 0
            ? bookingLabel(booking)
            : "Choose an available time"}
        </p>
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
      </main>
      <div className="sticky-actions">
        <Button onClick={confirm}>Confirm schedule</Button>
        <div className="or-divider">
          <span />
          OR
          <span />
        </div>
        <button
          className="whatsapp-button"
          onClick={() =>
            window.open(
              `https://wa.me/?text=${encodeURIComponent(`Hi, I'd like free advice about ${topic}.`)}`,
              "_blank",
              "noopener,noreferrer",
            )
          }
        >
          Chat on WhatsApp instead
        </button>
      </div>
    </>
  )
}
function Details({ details, onChange, booking, onEdit, onSubmit }) {
  const [attempted, setAttempted] = useState(false)
  const errors = {
    name:
      details.name.trim().length < 2
        ? "Enter your name (at least 2 characters)."
        : "",
    email: /^\S+@\S+\.\S+$/.test(details.email)
      ? ""
      : "Enter a valid email address.",
    phone: /^(?:\+91)?[6-9]\d{9}$/.test(details.phone.replace(/[\s-]/g, ""))
      ? ""
      : "Enter a 10-digit Indian mobile number, optionally with +91.",
  }
  return (
    <main className="flow-main details-main">
      <Progress step={3} />
      <h1 tabIndex={-1} className="details-title">
        Almost done
      </h1>
      <div className="summary-card">
        <div>
          <small>Your selected consultation</small>
          <strong>{bookingLabel(booking)} IST</strong>
        </div>
        <button type="button" onClick={onEdit}>
          <Image name="edit" width={20} height={20} />
          Edit
        </button>
      </div>
      <form
        className="details-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          setAttempted(true)
          if (!Object.values(errors).some(Boolean)) onSubmit()
        }}
      >
        <p>Please fill in your details</p>
        {[
          { key: "name", label: "Name", type: "text", complete: "name" },
          { key: "email", label: "Email", type: "email", complete: "email" },
          { key: "phone", label: "Phone number", type: "tel", complete: "tel" },
        ].map((field) => (
          <div key={field.key}>
            <label className={attempted && errors[field.key] ? "invalid" : ""}>
              <span>{field.label}*</span>
              <input
                required
                aria-label={field.label}
                aria-invalid={attempted && !!errors[field.key]}
                aria-describedby={
                  attempted && errors[field.key]
                    ? `${field.key}-error`
                    : undefined
                }
                type={field.type}
                autoComplete={field.complete}
                placeholder={`${field.label}*`}
                value={details[field.key]}
                onChange={(event) =>
                  onChange({ ...details, [field.key]: event.target.value })
                }
              />
            </label>
            {attempted && errors[field.key] && (
              <p id={`${field.key}-error`} className="field-error" role="alert">
                {errors[field.key]}
              </p>
            )}
          </div>
        ))}
        <div className="privacy-note">
          <Image name="shield" width={27} height={29} />
          <span>
            We promise a strictly spam-free service. We will not call you unless
            you ask us to do so.
          </span>
        </div>
        <div className="form-action">
          <Button type="submit">Confirm schedule</Button>
        </div>
      </form>
    </main>
  )
}
function Confirmation({ choice, booking, details, onRestart }) {
  const topic =
    choice === "I need both"
      ? "Health & Term Insurance"
      : choice === "I’m not sure"
        ? "Insurance advice"
        : choice
  return (
    <main className="flow-main confirmation-main">
      <Progress step={4} />
      <Image name="check" className="success-check" />
      <h1 tabIndex={-1}>Booking confirmed</h1>
      <div className="booking-card">
        <strong>{topic}</strong>
        <div>
          {bookingLabel(booking)} – {clockLabel(booking.minutes + 30)} IST
        </div>
        <p>
          A free 30-minute consultation to discuss your insurance needs with a
          Ditto advisor.
        </p>
      </div>
      <div className="thank-you">
        <p>
          Thank you {details.name.trim().split(/\s+/)[0]}, for booking a call
          with us.
          <br />
          This is a prototype booking. No call or email has been scheduled.
        </p>
      </div>
      <div className="confirmation-actions">
        <button onClick={() => downloadCalendar(booking)}>
          Add to calendar
        </button>
        <button onClick={onRestart}>Back to home</button>
      </div>
    </main>
  )
}
export default function App() {
  const [step, setStep] = useState(0)
  const [choice, setChoice] = useState("Health Insurance")
  const [booking, setBooking] = useState(firstBooking)
  const [custom, setCustom] = useState(false)
  const [details, setDetails] = useState(emptyDetails)
  useEffect(() => {
    window.scrollTo(0, 0)
    document.querySelector("h1")?.focus()
  }, [step])
  function restart() {
    setStep(0)
    setChoice("Health Insurance")
    setBooking(firstBooking())
    setCustom(false)
    setDetails(emptyDetails)
  }
  return (
    <div className="app-shell">
      <div className="transition-stage" key={step}>
        <div className="screen">
          <Header onBack={step > 0 ? () => setStep(step - 1) : undefined} />
          {step === 0 && <Welcome onStart={() => setStep(1)} />}
          {step === 1 && (
            <Choice
              onChoose={(value) => {
                setChoice(value)
                setStep(2)
              }}
            />
          )}
          {step === 2 && (
            <Schedule
              choice={choice}
              booking={booking}
              onChange={setBooking}
              custom={custom}
              onCustom={setCustom}
              onNext={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <Details
              details={details}
              onChange={setDetails}
              booking={booking}
              onEdit={() => setStep(2)}
              onSubmit={() => setStep(4)}
            />
          )}
          {step === 4 && (
            <Confirmation
              choice={choice}
              booking={booking}
              details={details}
              onRestart={restart}
            />
          )}
        </div>
      </div>
    </div>
  )
}
