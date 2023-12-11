$(function(){
    $('form.unsubscribe-newsletter').on('submit', function(e){
        e.preventDefault();
        var email = this.querySelector('input[name="email"]').value;
        $.ajax({
            method: "POST",
            url: '/newsletter?json=1',
            dataType:'json',
            data: 'email=' + email,
            success: function(data){
                if (data.success) {
                    swal({
                        width: 1000,
                        confirmButtonText: 'OK',
                        confirmButtonClass: 'btn',
                        title: L['UNSUBSCRIBE_NEWSLETTER'],
                        html: '<div><div class="row" style="padding: 40px;"><div><div class="row" style="padding: 40px;">' + data.message + '</div></div></div></div>'
                    }).then(
                        function () {
                            window.location.replace('/');
                        },
                        function () {
                            window.location.replace('/');
                        }
                    );
                } else {
                    swal({
                        width: 1000,
                        confirmButtonText: 'OK',
                        confirmButtonClass: 'btn',
                        title: L['UNSUBSCRIBE_NEWSLETTER'],
                        html: '<div><div class="row" style="padding: 40px;">' + data.message + '</div></div>'
                    })
                }
            },
        });
    })
});
