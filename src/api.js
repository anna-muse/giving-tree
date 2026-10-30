const DEPLOYMENT_ID = 'AKfycbxP6VP5p6aMVHfsd2ViUEXww0CFRkmwI0F-9_ao1k0LUji0KQfE0E_vBJg2uewmbNsPow';
const API_URL = `https://script.google.com/macros/s/${DEPLOYMENT_ID}/exec`;

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
export const lookupTag = (code) => post({ action: 'LOOKUP_TAG', code }).then((r) => r.gift);
export const claimTags = (args) => post({ action: 'CLAIM_TAGS', ...args });
export const receiveGift = (args) => post({ action: 'RECEIVE_GIFT', ...args });
export const undoReceiveGift = (args) => post({ action: 'UNDO_RECEIVE_GIFT', ...args });
