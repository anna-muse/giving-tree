const DEPLOYMENT_ID = 'AKfycbyEc0hrEABXLIhevJP66Q4Itos6v2O1I9fPoYyW-inXw6Ah-DCFDkg8225qFwx1BG73Ig';
const API_URL = `https://script.google.com/macros/s/${DEPLOYMENT_ID}/exec`;

import { Gift } from './entities/gift.js';

async function post(body) {
  let response;
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // avoids a CORS preflight
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error('Unexpected response from the server. Please try again.');
  }
  if (!result.ok) throw new Error(result.error || 'Request failed.');
  return result;
}

export const submitNomination = (payload) => post({ action: 'NOMINATE', ...payload });
export const getTag = (code) => post({ action: 'GET_TAG', id: code }).then((r) => {
  console.log('in api', r.gift);
  return new Gift().fromExternalForm(r.gift);
});
export const claimTags = (args) => post({ action: 'CLAIM_TAGS', ...args });
export const receiveGift = (args) => post({ action: 'RECEIVE_GIFT', ...args });
export const undoReceiveGift = (args) => post({ action: 'UNDO_RECEIVE_GIFT', ...args });
