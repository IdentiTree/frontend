/*
  Write out the Targle Explorer URL given the network and message ID, with the given preamble.
  @param {!string} preamble
  @param {!string} network
  @param {!string} messageId
*/
function logExplorerUrl(preamble, network, messageId) {
    console.log(`${preamble} https://explorer.iota.org/${network}net/transaction/${messageId}`);
  }
  
  exports.logExplorerUrl = logExplorerUrl;