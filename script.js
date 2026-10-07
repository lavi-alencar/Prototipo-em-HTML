document.addEventListener("DOMContentLoaded", function() {

    const botoesLinks = document.querySelectorAll('.list-select a, .list-vision a');

    botoesLinks.forEach(link => {
       
        link.style.color = "#f5e5d0";
        link.style.textDecoration = "none";
        link.style.display = "inline-block";
    });
});
