import Swal from 'sweetalert2'

export const alertService = {
  success(message) {
    return Swal.fire({
      icon: 'success',
      title: message,
      timer: 1600,
      showConfirmButton: false,
    })
  },

  error(message) {
    return Swal.fire({
      icon: 'error',
      title: message,
    })
  },

  toast(message, icon = 'success') {
    return Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 1800,
      timerProgressBar: true,
    }).fire({ icon, title: message })
  },

  async confirm(options = {}) {
    const result = await Swal.fire({
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      ...options,
    })

    return result.isConfirmed
  },
}
