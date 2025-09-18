// Global variables
let currentLanguage = "pl"
let db = null

// Initialize Firebase
function initializeFirebase() {
  console.log("[v0] Sprawdzanie inicjalizacji Firebase...")

  if (window.firebaseError) {
    console.error("[v0] Firebase ma błąd:", window.firebaseError)
    return false
  }

  if (window.firebaseInitialized && window.firebaseDb) {
    db = window.firebaseDb
    console.log("[v0] Firebase zainicjalizowany pomyślnie!")
    return true
  }

  console.log("[v0] Firebase jeszcze nie gotowy...")
  return false
}

// Language switching
function switchLanguage(lang) {
  currentLanguage = lang

  // Update language buttons
  document.getElementById("lang-pl").className =
    lang === "pl"
      ? "px-3 py-1 bg-cyan-500 text-black rounded-md text-sm font-medium transition-colors hover:bg-cyan-400"
      : "px-3 py-1 bg-gray-700 text-gray-300 rounded-md text-sm font-medium transition-colors hover:bg-gray-600"

  document.getElementById("lang-en").className =
    lang === "en"
      ? "px-3 py-1 bg-cyan-500 text-black rounded-md text-sm font-medium transition-colors hover:bg-cyan-400"
      : "px-3 py-1 bg-gray-700 text-gray-300 rounded-md text-sm font-medium transition-colors hover:bg-gray-600"

  // Update all elements with language attributes
  const elements = document.querySelectorAll("[data-pl], [data-en]")
  elements.forEach((element) => {
    const text = element.getAttribute(`data-${lang}`)
    if (text) {
      element.textContent = text
    }
  })

  // Update placeholders
  const placeholderElements = document.querySelectorAll(`[data-${lang}-placeholder]`)
  placeholderElements.forEach((element) => {
    const placeholder = element.getAttribute(`data-${lang}-placeholder`)
    if (placeholder) {
      element.placeholder = placeholder
    }
  })

  console.log(`[v0] Język zmieniony na: ${lang}`)
}

// Mobile menu toggle
function toggleMobileMenu() {
  const mobileMenu = document.getElementById("mobile-menu")
  mobileMenu.classList.toggle("hidden")
}

// Contact form handling
async function handleContactForm(event) {
  event.preventDefault()

  if (!db) {
    console.error("[v0] Firebase nie jest zainicjalizowany")
    alert(currentLanguage === "pl" ? "Wystąpił błąd. Spróbuj ponownie." : "An error occurred. Please try again.")
    return
  }

  // Get form data
  const name = document.getElementById("contact-name").value.trim()
  const email = document.getElementById("contact-email").value.trim()
  const subject = document.getElementById("contact-subject").value.trim()
  const message = document.getElementById("contact-message").value.trim()

  // Validate form
  if (!name || !email || !subject || !message) {
    alert(currentLanguage === "pl" ? "Proszę wypełnić wszystkie pola." : "Please fill in all fields.")
    return
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    alert(currentLanguage === "pl" ? "Proszę podać prawidłowy adres e-mail." : "Please enter a valid email address.")
    return
  }

  try {
    // Show loading state
    const submitButton = event.target.querySelector('button[type="submit"]')
    const originalText = submitButton.textContent
    submitButton.disabled = true
    submitButton.classList.add("loading")
    submitButton.textContent = currentLanguage === "pl" ? "Wysyłanie..." : "Sending..."

    // Prepare message data
    const messageData = {
      name: name,
      email: email,
      subject: subject,
      message: message,
      language: currentLanguage,
      created: new Date().toISOString(),
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    }

    console.log("[v0] Wysyłanie wiadomości:", messageData)

    // Save to Firebase
    const messagesRef = window.firebaseRef(db, "messages")
    const newMessageRef = window.firebasePush(messagesRef)
    await window.firebaseSet(newMessageRef, messageData)

    console.log("[v0] Wiadomość wysłana pomyślnie!")

    // Show success message
    document.getElementById("contact-form").style.display = "none"
    document.getElementById("contact-success").classList.remove("hidden")

    // Reset form after delay
    setTimeout(() => {
      document.getElementById("contact-form").reset()
      document.getElementById("contact-form").style.display = "block"
      document.getElementById("contact-success").classList.add("hidden")

      // Reset button state
      submitButton.disabled = false
      submitButton.classList.remove("loading")
      submitButton.textContent = originalText
    }, 5000)
  } catch (error) {
    console.error("[v0] Błąd wysyłania wiadomości:", error)

    // Reset button state
    const submitButton = event.target.querySelector('button[type="submit"]')
    submitButton.disabled = false
    submitButton.classList.remove("loading")
    submitButton.textContent = currentLanguage === "pl" ? "Wyślij Wiadomość" : "Send Message"

    alert(
      currentLanguage === "pl"
        ? "Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie."
        : "An error occurred while sending the message. Please try again.",
    )
  }
}

// Load projects (shows empty project templates)
function loadProjects() {
  // Show projects grid and hide no projects message
  const projectsGrid = document.getElementById("projects-grid")
  const noProjects = document.getElementById("no-projects")

  projectsGrid.style.display = "grid"
  noProjects.style.display = "none"

  console.log("[v0] Project templates loaded successfully")
}

// Smooth scrolling for navigation links
function initSmoothScrolling() {
  const links = document.querySelectorAll('a[href^="#"]')

  links.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()

      const targetId = this.getAttribute("href")
      const targetSection = document.querySelector(targetId)

      if (targetSection) {
        const headerHeight = 80 // Account for fixed header
        const targetPosition = targetSection.offsetTop - headerHeight

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        })

        // Close mobile menu if open
        const mobileMenu = document.getElementById("mobile-menu")
        if (!mobileMenu.classList.contains("hidden")) {
          mobileMenu.classList.add("hidden")
        }
      }
    })
  })
}

// Section reveal animation
function initSectionReveal() {
  const sections = document.querySelectorAll(".section-reveal")

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed")
        }
      })
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    },
  )

  sections.forEach((section) => {
    observer.observe(section)
  })
}

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] DOM loaded, initializing...")

  // Initialize Firebase
  if (initializeFirebase()) {
    console.log("[v0] Firebase ready immediately")
  } else {
    // Wait for Firebase to be ready
    window.addEventListener("firebaseReady", () => {
      if (initializeFirebase()) {
        console.log("[v0] Firebase ready after event")
      }
    })
  }

  // Initialize other features
  initSmoothScrolling()
  initSectionReveal()
  loadProjects()

  // Set default language
  switchLanguage("pl")

  console.log("[v0] Initialization complete")
})

// Handle window resize
window.addEventListener("resize", () => {
  // Close mobile menu on resize
  const mobileMenu = document.getElementById("mobile-menu")
  if (window.innerWidth >= 768) {
    mobileMenu.classList.add("hidden")
  }
})
