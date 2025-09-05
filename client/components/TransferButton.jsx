import React from 'react';

function TransferButton({ onTransfer, disabled }) {
  return (
    <button onClick={onTransfer} disabled={disabled}>
      Transfer Selected Playlists
    </button>
  );
}

export default TransferButton;
