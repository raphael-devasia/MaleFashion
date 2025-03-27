// public/assets/js/toast.js
;(function () {
    // Create global Toast object that can be used across your application
    window.AppToast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        iconColor: "#ffffff",
        customClass: {
            popup: "colored-toast",
            title: "toast-title",
        },
        color: "#ffffff",
        didOpen: (toast) => {
            toast.addEventListener("mouseenter", Swal.stopTimer)
            toast.addEventListener("mouseleave", Swal.resumeTimer)
        },
    })

    // Add custom styles for toasts
    document.head.insertAdjacentHTML(
        "beforeend",
        `
    <style>
      .colored-toast {
        border-radius: 10px !important;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important;
        padding: 15px 20px !important;
        width: auto !important;
        max-width: 350px !important;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
      }
      .colored-toast.swal2-icon-error {
        background: #f44336 !important;
      }
      .colored-toast.swal2-icon-success {
        background: #4CAF50 !important;
      }
      .colored-toast.swal2-icon-info {
        background: #2196F3 !important;
      }
      .colored-toast.swal2-icon-warning {
        background: #ff9800 !important;
      }
      .toast-title {
        font-size: 16px !important;
        font-weight: 500 !important;
        margin-left: 10px !important;
      }
      .swal2-timer-progress-bar {
        background: rgba(255, 255, 255, 0.5) !important;
        height: 4px !important;
        bottom: 0 !important;
      }
    </style>
  `
    )
})()
