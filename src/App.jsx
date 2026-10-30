// import CheckIn from './CheckIn.jsx';
// import { USE_FAKE_API } from './config.js';
import NominationFormView from './views/nominationFormView.jsx';
import ClaimTagsView from './views/claimTagsView.jsx';

// Pages are chosen with query strings so GitHub Pages needs no special setup:
//   (none)        nomination form
//   ?t=<code>     donor page, adding that tag (what a phone camera scan opens)
//   ?page=take    donor page
//   ?page=checkin volunteer check-in
//   ?page=demo    fake test tags (only while USE_FAKE_API is true)
export default function App() {
  const params = new URLSearchParams(window.location.search);
  const page = params.get('page');
  if (params.has('t') || page === 'take') return <ClaimTagsView />;
  // if (page === 'checkin') return <CheckIn />;
  return <NominationFormView />;
  // return <h1>Giving Tree</h1>;
}
