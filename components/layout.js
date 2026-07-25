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

        if (headerContainer) {
            headerContainer.innerHTML = headerHTML;
        }

        if (footerContainer) {
            footerContainer.innerHTML = footerHTML;
        }

    } catch (error) {
        console.error("Layout Error:", error);
    }
}

function initializeNavigation() {

    setActiveLink();

    const menuButton = document.getElementById("menu-btn");
    const mobileNav = document.getElementById("mobile-nav");

    if (!menuButton || !mobileNav){
        console.warn("Mobile menu elements not found");
        return;
    } 

    menuButton.addEventListener("click", () => {
        const isOpen = mobileNav.classList.toggle("is-open");
        menuButton.classList.toggle("active");
        menuButton.setAttribute("aria-expanded", isOpen);
    });

    const mobileLinks = mobileNav.querySelectorAll('.mobile-nav-link');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileNav.classList.remove("is-open");
            menuButton.classList.remove("active");
            menuButton.setAttribute("aria-expanded", "false");
        });
    });

    
 window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
        const mobileNav = document.getElementById("mobile-nav");
        const menuButton = document.getElementById("menu-btn");
        
        if (mobileNav && menuButton) {
            mobileNav.classList.remove("is-open");
            menuButton.classList.remove("active");
            menuButton.setAttribute("aria-expanded", "false");
        }
    }
});

}

function setActiveLink() {

    const currentPage =
        window.location.pathname.split("/").pop();

    const navLinks =
        document.querySelectorAll(".nav-link");

    navLinks.forEach(link => {

        link.classList.remove("active");

        const href = link.getAttribute("href");

        if (href === currentPage) {
            link.classList.add("active");
        }

    });

    document.body.style.visibility = "visible";

}