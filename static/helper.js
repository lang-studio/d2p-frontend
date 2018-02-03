function containsDestinationId(arr, did) {
    // js has no good list.exists function, hence this function
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].destination_id === did) {
            return true;
        }
    }
    return false
}