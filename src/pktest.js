const placekit = require('@placekit/client-js');

const pk = placekit('pk_LnLbsPDxePkdcdHzuKw+gvfo1VHjD9b/+Fy+SPbPp0U=', {
  countries: ['fr'],
});

pk.search('42 avenue Champs-Élysées Paris').then((res) => {
  console.log(res.results);
});