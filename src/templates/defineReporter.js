function $$name ( $$arguments ) {
    let data = $_reporter_data[ $$reporter ];
    
    if ( $$reporterReturns == 'truthy' ) return !!data;
    return data;
}