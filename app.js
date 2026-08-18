// Reline Consulting Main JavaScript Logic

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // 1. Mobile Menu Toggle
    // -------------------------------------------------------------
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle button
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            const icon = mobileToggle.querySelector('i');
            if (navMenu.classList.contains('open')) {
                icon.className = 'fa-solid fa-xmark';
            } else {
                icon.className = 'fa-solid fa-bars-staggered';
            }
        });
    }

    // Nav link clicks — always active, regardless of mobile toggle presence
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');

            // Intercept in-page anchor links and handle scroll manually
            if (targetId && targetId.startsWith('#')) {
                e.preventDefault();

                // Close mobile menu if open
                if (navMenu) navMenu.classList.remove('open');
                const icon = mobileToggle ? mobileToggle.querySelector('i') : null;
                if (icon) icon.className = 'fa-solid fa-bars-staggered';

                // Update active class
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                // scrollIntoView is the most reliable: works from any scroll position
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    // Scroll spy active nav highlighting
    window.addEventListener('scroll', () => {
        let current = '';
        const sections = document.querySelectorAll('section');
        const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // -------------------------------------------------------------
    // 2. Contact Form Validation and Mock Submission
    // -------------------------------------------------------------
    const contactForm = document.getElementById('contact-form');
    const successMsg = document.getElementById('form-success');
    const resetFormBtn = document.getElementById('reset-form-btn');
    const submitBtn = document.getElementById('submit-btn');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (validateContactForm()) {
                submitContactForm();
            }
        });
    }

    if (resetFormBtn && contactForm) {
        resetFormBtn.addEventListener('click', () => {
            contactForm.classList.remove('hidden');
            successMsg.classList.add('hidden');
            contactForm.reset();

            // Clean up error states
            const formGroups = contactForm.querySelectorAll('.form-group');
            formGroups.forEach(group => {
                group.classList.remove('has-error', 'has-success');
            });
        });
    }

    function setError(inputElement, errorElementId) {
        const parent = inputElement.closest('.form-group');
        parent.classList.add('has-error');
        parent.classList.remove('has-success');
    }

    function setSuccess(inputElement) {
        const parent = inputElement.closest('.form-group');
        parent.classList.remove('has-error');
        parent.classList.add('has-success');
    }

    function validateContactForm() {
        let isValid = true;

        const nameField = document.getElementById('form-name');
        const emailField = document.getElementById('form-email');
        const phoneField = document.getElementById('form-phone');
        const messageField = document.getElementById('form-message');

        // Name Validation
        if (!nameField.value.trim()) {
            setError(nameField);
            isValid = false;
        } else {
            setSuccess(nameField);
        }

        // Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailREGEXMatch(emailField.value)) {
            setError(emailField);
            isValid = false;
        } else {
            setSuccess(emailField);
        }

        // Phone Validation (Optional but if entered, should look like phone number)
        if (phoneField.value.trim()) {
            const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-s\.]?[0-9]{3}[-s\.]?[0-9]{4,6}$/im;
            if (!phoneRegex.test(phoneField.value.trim())) {
                setError(phoneField);
                isValid = false;
            } else {
                setSuccess(phoneField);
            }
        } else {
            const parent = phoneField.closest('.form-group');
            parent.classList.remove('has-error', 'has-success');
        }

        // Message Validation
        if (!messageField.value.trim()) {
            setError(messageField);
            isValid = false;
        } else {
            setSuccess(messageField);
        }

        return isValid;
    }

    function emailREGEXMatch(email) {
        const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return regex.test(email.trim());
    }

    // Live Validation On Blur
    const inputs = ['form-name', 'form-email', 'form-phone', 'form-message'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('blur', () => {
                validateField(el);
            });
            el.addEventListener('input', () => {
                const parent = el.closest('.form-group');
                if (parent.classList.contains('has-error')) {
                    validateField(el);
                }
            });
        }
    });

    function validateField(el) {
        if (el.id === 'form-name') {
            if (!el.value.trim()) setError(el);
            else setSuccess(el);
        }
        if (el.id === 'form-email') {
            if (!emailREGEXMatch(el.value)) setError(el);
            else setSuccess(el);
        }
        if (el.id === 'form-phone') {
            if (el.value.trim()) {
                const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-s\.]?[0-9]{3}[-s\.]?[0-9]{4,6}$/im;
                if (!phoneRegex.test(el.value.trim())) setError(el);
                else setSuccess(el);
            } else {
                const parent = el.closest('.form-group');
                parent.classList.remove('has-error', 'has-success');
            }
        }
        if (el.id === 'form-message') {
            if (!el.value.trim()) setError(el);
            else setSuccess(el);
        }
    }

    function submitContactForm() {
        const spinner = submitBtn.querySelector('.spinner');
        const btnText = submitBtn.querySelector('.btn-text');

        const nameField = document.getElementById('form-name');
        const emailField = document.getElementById('form-email');
        const phoneField = document.getElementById('form-phone');
        const messageField = document.getElementById('form-message');

        // Disable elements & Show spinner
        submitBtn.disabled = true;
        spinner.classList.remove('hidden');
        btnText.textContent = 'Sending...';

        fetch('/api/enquiries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'contact',
                name: nameField.value.trim(),
                email: emailField.value.trim(),
                phone: phoneField.value.trim() || null,
                message: messageField.value.trim()
            })
        })
            .then(response => {
                if (!response.ok) throw new Error('Submission failed');
                return response.json();
            })
            .then(data => {
                // Re-enable and hide form
                submitBtn.disabled = false;
                spinner.classList.add('hidden');
                btnText.textContent = 'Submit Message';

                contactForm.classList.add('hidden');
                successMsg.classList.remove('hidden');
            })
            .catch(err => {
                console.error('Submission error:', err);
                submitBtn.disabled = false;
                spinner.classList.add('hidden');
                btnText.textContent = 'Submit Message';
                alert('Failed to send message. Please verify the backend is running and try again.');
            });
    }

    // -------------------------------------------------------------
    // 3. Chatbot Core Engine
    // -------------------------------------------------------------
    const chatbotTrigger = document.getElementById('chatbot-trigger');
    const chatWindow = document.getElementById('chat-window');
    const chatClose = document.getElementById('chat-close');
    const chatNotification = document.getElementById('chat-notification');
    const chatBody = document.getElementById('chat-body');
    const chatOptionsContainer = document.getElementById('chat-options-container');
    const chatInputWrapper = document.getElementById('chat-input-wrapper');
    const chatInputField = document.getElementById('chat-input-field');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const serviceLearnButtons = document.querySelectorAll('.chatbot-trigger-service');

    let currentBotState = 'initial'; // Track conversation routing

    // Toggle Chat Screen
    if (chatbotTrigger && chatWindow) {
        chatbotTrigger.addEventListener('click', () => {
            chatWindow.classList.toggle('hidden');
            const iconOpen = chatbotTrigger.querySelector('.icon-open');
            const iconClose = chatbotTrigger.querySelector('.icon-close');

            if (!chatWindow.classList.contains('hidden')) {
                iconOpen.classList.add('hidden');
                iconClose.classList.remove('hidden');

                // Clear Notification Badge on click
                if (chatNotification) {
                    chatNotification.classList.add('hidden');
                }

                // Autoscroll chat area
                scrollToBottom();
            } else {
                iconOpen.classList.remove('hidden');
                iconClose.classList.add('hidden');
            }
        });
    }

    if (chatClose) {
        chatClose.addEventListener('click', () => {
            chatWindow.classList.add('hidden');
            const iconOpen = chatbotTrigger.querySelector('.icon-open');
            const iconClose = chatbotTrigger.querySelector('.icon-close');
            iconOpen.classList.remove('hidden');
            iconClose.classList.add('hidden');
        });
    }

    // Connect page "Discuss Scope" buttons to chatbot
    serviceLearnButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const query = btn.getAttribute('data-query');

            // Open chatbot panel if hidden
            if (chatWindow.classList.contains('hidden')) {
                chatbotTrigger.click();
            }

            // Route search parameter
            handleUserChoice(query, btn.textContent.trim());
        });
    });

    // Option Chips Event Delegation
    if (chatOptionsContainer) {
        chatOptionsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('chip-option')) {
                const query = e.target.getAttribute('data-query');
                const label = e.target.textContent;
                handleUserChoice(query, label);
            }
        });
    }

    // Input message Submission (Consultations Callback trigger)
    if (chatSendBtn && chatInputField) {
        chatSendBtn.addEventListener('click', submitCallbackDetails);
        chatInputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                submitCallbackDetails();
            }
        });
    }

    function scrollToBottom() {
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // Append standard user request message
    function appendUserMessage(text) {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const userMsgHtml = `
            <div class="message message-user">
                <div class="msg-content">
                    <p>${escapeHTML(text)}</p>
                    <span class="msg-time">${timeStr}</span>
                </div>
            </div>
        `;
        chatBody.innerHTML += userMsgHtml;
        scrollToBottom();
    }

    // Show temporary pulsing dots representing bot thinking
    function showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'message message-bot typing-indicator-item';
        indicator.innerHTML = `
            <div class="msg-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        chatBody.appendChild(indicator);
        scrollToBottom();
        return indicator;
    }

    // Bot message formatting & rendering
    function appendBotMessage(text, options = []) {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const botMsgHtml = `
            <div class="message message-bot">
                <div class="msg-content">
                    <p>${text}</p>
                    <span class="msg-time">${timeStr}</span>
                </div>
            </div>
        `;
        chatBody.innerHTML += botMsgHtml;

        // Render updated option chips
        updateOptionChips(options);
        scrollToBottom();
    }

    // Update Quick Select Option Chips
    function updateOptionChips(optionsList) {
        if (!chatOptionsContainer) return;

        if (optionsList.length === 0) {
            chatOptionsContainer.classList.add('hidden');
        } else {
            chatOptionsContainer.classList.remove('hidden');
            chatOptionsContainer.innerHTML = '';

            optionsList.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'chip-option';
                btn.setAttribute('data-query', opt.query);
                btn.textContent = opt.label;
                chatOptionsContainer.appendChild(btn);
            });
        }
    }

    // Process Bot Conversation Flow routing
    function handleUserChoice(query, text) {
        appendUserMessage(text);

        // Disable choices while typing
        updateOptionChips([]);

        const loader = showTypingIndicator();

        setTimeout(() => {
            loader.remove();

            let replyText = "";
            let responses = [];

            // Conversation Decision Matrix
            switch (query) {
                case 'services_overview':
                    replyText = "We offer premium solutions across three pillars: <br><br>• <strong>Web Development</strong> (Cloud applications, Modern UI/UX)<br>• <strong>SAP</strong> (S/4HANA integrations, Custom ERP optimization)<br>• <strong>Microsoft Dynamics</strong> (CRM dashboard automation).<br><br>Which area would you like to explore?";
                    responses = [
                        { query: 'web_dev', label: '💻 Web Development' },
                        { query: 'sap', label: '📈 SAP Consulting' },
                        { query: 'ms_dynamics', label: '📊 MS Dynamics' },
                        { query: 'main_menu', label: '🔙 Back to Menu' }
                    ];
                    break;
                case 'web_dev':
                    replyText = "Our <strong>Web Development</strong> team builds production-ready, beautiful, and secure web application portals. We specialize in React, Next.js, and Node backend stacks integrated with robust API models. <br><br>Would you like to schedule an technical discovery call?";
                    responses = [
                        { query: 'consultation', label: '📅 Book Consultation' },
                        { query: 'services_overview', label: '💼 Other Services' },
                        { query: 'main_menu', label: '🔙 Main Menu' }
                    ];
                    break;
                case 'sap':
                    replyText = "For <strong>SAP Consulting</strong>, we assist firms in migrating to SAP S/4HANA database speeds, auditing logistics processes, and building customized ERP interfaces (SAP Fiori). <br><br>Shall we schedule a consultation to map your migration pathway?";
                    responses = [
                        { query: 'consultation', label: '📅 Request Roadmap Call' },
                        { query: 'services_overview', label: '💼 Other Services' },
                        { query: 'main_menu', label: '🔙 Main Menu' }
                    ];
                    break;
                case 'ms_dynamics':
                    replyText = "Our certified <strong>Microsoft Dynamics 365</strong> architects design customer relationship management pipelines, build automated Power Platform flows, and implement Power BI executive reporting systems.<br><br>Would you like a demo or discovery call?";
                    responses = [
                        { query: 'consultation', label: '📅 Schedule Demo' },
                        { query: 'services_overview', label: '💼 Other Services' },
                        { query: 'main_menu', label: '🔙 Main Menu' }
                    ];
                    break;
                case 'about_info':
                    replyText = "<strong>Reline Consulting</strong> is a boutique IT delivery firm with offices in San Francisco. Since 2016, we have successfully modernized systems for over 250 enterprise clients globally. We prioritize modular architectures and clear ROI pipelines.";
                    responses = [
                        { query: 'services_overview', label: '💼 Explore Services' },
                        { query: 'consultation', label: '📅 Connect With Us' },
                        { query: 'main_menu', label: '🔙 Main Menu' }
                    ];
                    break;
                case 'direct_contacts':
                    replyText = "Certainly! You can contact us anytime via: <br><br>📞 <strong>Phone:</strong> <a href='tel:+18005550199' style='color:#00f2fe;text-decoration:underline;'>+1 (800) 555-0199</a><br>✉️ <strong>Email:</strong> <a href='mailto:contact@relineconsulting.com' style='color:#00f2fe;text-decoration:underline;'>contact@relineconsulting.com</a><br><br>Our team responds to all inbox requests within 2 business hours.";
                    responses = [
                        { query: 'consultation', label: '📅 Let Us Call You' },
                        { query: 'main_menu', label: '🔙 Main Menu' }
                    ];
                    break;
                case 'consultation':
                    replyText = "I'd love to organize a meeting with our lead technology architect. <br><br>Please select your preference or enter your phone/email below:";
                    responses = [
                        { query: 'main_menu', label: '🔙 Cancel & Return' }
                    ];
                    // Enable bottom callback inputs
                    chatInputWrapper.classList.remove('hidden');
                    currentBotState = 'callback_mode';
                    chatInputField.focus();
                    break;
                case 'main_menu':
                default:
                    replyText = "How can we assist you today? Select one of the paths below:";
                    responses = [
                        { query: 'services_overview', label: '💼 Explore Services' },
                        { query: 'about_info', label: '🏢 Learn About Reline' },
                        { query: 'consultation', label: '📅 Talk to Consultant' },
                        { query: 'direct_contacts', label: '📞 Call / Email' }
                    ];
                    // Make sure custom input is tucked away when returning to main menu
                    chatInputWrapper.classList.add('hidden');
                    currentBotState = 'initial';
                    break;
            }

            appendBotMessage(replyText, responses);
        }, 800);
    }

    // Submit callback Details inside Chatbot drawer
    function submitCallbackDetails() {
        const text = chatInputField.value.trim();
        if (!text) return;

        chatInputField.value = '';
        appendUserMessage(text);

        // Hide input wrapper and quick options
        chatInputWrapper.classList.add('hidden');
        updateOptionChips([]);

        const loader = showTypingIndicator();

        const isEmail = text.includes('@');
        const payload = {
            type: 'chatbot',
            name: 'Chatbot Visitor',
            email: isEmail ? text : null,
            phone: !isEmail ? text : null,
            message: `Chatbot callback request value: ${text}`
        };

        fetch('/api/enquiries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
            .then(response => {
                if (!response.ok) throw new Error('API submission failed');
                return response.json();
            })
            .then(data => {
                loader.remove();

                // Format dynamic response acknowledging details
                let confirmMsg = "Excellent! I have recorded your details. A senior architect from Reline Consulting will reach out to you shortly.";

                if (isEmail) {
                    confirmMsg = `Thank you for sharing your email <strong>${escapeHTML(text)}</strong>. A senior partner will reach out to schedule our session shortly.`;
                } else {
                    confirmMsg = `Perfect! I've recorded your callback number <strong>${escapeHTML(text)}</strong>. We will call you within 24 hours.`;
                }

                const menuOptions = [
                    { query: 'services_overview', label: '💼 Explore Services' },
                    { query: 'main_menu', label: '🔙 Main Menu' }
                ];

                appendBotMessage(confirmMsg, menuOptions);
                currentBotState = 'initial';
            })
            .catch(err => {
                console.error('Chatbot API error:', err);
                loader.remove();

                appendBotMessage("Apologies, I encountered an server connection issue saving your request. Please try again or email us directly.", [
                    { query: 'consultation', label: '📅 Re-submit Details' },
                    { query: 'main_menu', label: '🔙 Main Menu' }
                ]);
                currentBotState = 'initial';
            });
    }

    // Helper helper to sanitize strings
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g,
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }
});
