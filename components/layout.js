"use strict";

document.addEventListener("DOMContentLoaded", async () => {
    await loadLayout();
    initializeNavigation();
});

async function loadLayout() {
    try {
        const [headerResponse, footerResponse] = await Promise.all([
            fetch("components/header.html"),
            fetch("components/footer.html")
        ]);

        if (!headerResponse.ok || !footerResponse.ok) {
            throw new Error("Unable to load shared layout.");
        }

        const headerHTML = await headerResponse.text();
        const footerHTML = await footerResponse.text();

        const headerContainer = document.getElementById("header-container");
        const footerContainer = document.getElementById("footer-container");

        if (headerContainer) headerContainer.innerHTML = headerHTML;
        if (footerContainer) footerContainer.innerHTML = footerHTML;

    } catch (error) {
        console.error("Layout Error:", error);
    }
}

function initializeNavigation() {

    setActiveLink();

    const menuButton = document.getElementById("menu-btn");
    const mobileNav = document.getElementById("mobile-nav");
    const overlay = document.getElementById("nav-overlay");

    if (!menuButton || !mobileNav || !overlay) {
        console.warn("Mobile menu elements not found");
        return;
    }

    function openMenu() {
        mobileNav.classList.add("is-open");
        overlay.classList.add("is-open");
        menuButton.classList.add("active");
        menuButton.setAttribute("aria-expanded", "true");
        document.body.classList.add("no-scroll"); 
    }

    function closeMenu() {
        mobileNav.classList.remove("is-open");
        overlay.classList.remove("is-open");
        menuButton.classList.remove("active");
        menuButton.setAttribute("aria-expanded", "false");
        document.body.classList.remove("no-scroll");
    }

    menuButton.addEventListener("click", () => {
        const isOpen = mobileNav.classList.contains("is-open");
        isOpen ? closeMenu() : openMenu();
    });

    const mobileLinks = mobileNav.querySelectorAll(".mobile-nav-link");
    mobileLinks.forEach(link => {
        link.addEventListener("click", closeMenu);
    });

    overlay.addEventListener("click", closeMenu);

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && mobileNav.classList.contains("is-open")) {
            closeMenu();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    });
}

function setActiveLink() {

    const currentPage = window.location.pathname.split("/").pop();

      const navLinks = document.querySelectorAll(".nav-link");

    navLinks.forEach(link => {
        link.classList.remove("active");

        const href = link.getAttribute("href");
        const linkPage = href ? href.split("/").pop() : "";

        if (linkPage === currentPage) {
            link.classList.add("active");
        }
    });

    document.body.style.visibility = "visible";
}