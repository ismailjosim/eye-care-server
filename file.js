const reviewDeletedHandalar = (id, email) => {
    swal({
        title: "Are you sure?",
        text: "Deleted This Review!",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    }).then((willDelete) => {
        if (willDelete) {
            fetch(
                `https://travel-poient-holiday-server.vercel.app/my-reviews?_id=${ id }&email=${ email }`,
                {
                    method: "DELETE",
                    headers: {
                        "content-type": "application/json",
                        authorization: `Bearer ${ localStorage.getItem(
                            "travel_point_token"
                        ) }`,
                    },
                }
            )
                .then((res) => {
                    if (res.status === 401 || res.status === 403) {
                        userSignOut();
                    }
                    return res.json();
                })
                .then((data) => {
                    if (data.deletedCount === 1) {
                        setDeleted(true);
                        swal("Done! Your Order has been deleted!", {
                            icon: "success",
                        });
                    }
                });
        } else {
            swal("Your Order is safe!");
        }
    });
};
