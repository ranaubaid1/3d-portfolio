const cursor = document.querySelector(".cursor");

if (cursor) {
  document.addEventListener("mousemove", (e) => {
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
  });

  const links = document.querySelectorAll("a, .btn, .btn-outline, .menu-btn, button");
  links.forEach((link) => {
    link.addEventListener("mouseenter", () => {
      cursor.classList.add("cursor-hover");
    });
    link.addEventListener("mouseleave", () => {
      cursor.classList.remove("cursor-hover");
    });
  });
}
