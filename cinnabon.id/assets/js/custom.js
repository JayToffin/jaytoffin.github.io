var locations = [
    ['Cinnabon Grand Indonesia - Jl. M.H. Thamrin No.1, Kb. Melati, Kec. Menteng, Kota Jakarta Pusat, Daerah Khusus Ibukota Jakarta 10310', -6.195573843567218, 106.82160377234617, 1],
    ['Cinnabon Gandaria City - Jl. Sultan Iskandar Muda LG Floor, RT.10/RW.6, Kby. Lama Utara, Kec. Kby. Lama, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12240', -6.244361143357063, 106.7836160727939, 2],
    ['Cinnabon Pondok Indah Mall - Pd. Indah Mall Street Gallery, Jl. Metro Pondok Indah, RT.1/RW.16, Pd. Pinang, Kec. Kby. Lama, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12310', -6.266673294085604, 106.78412779564555, 3],
    ['Cinnabon Central Park - Jl. Letjen S. Parman No.28, RT.12/RW.1, Tj. Duren Sel., Kec. Grogol petamburan, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11470', -6.1759733333418145, 106.7905657396608, 4],
    ['Cinnabon Lippo Mall Puri - Jl. Puri Indah Raya, RT.3/RW.2, Kembangan Sel., Kec. Kembangan, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11610', -6.189711633427399, 106.73959054109771, 5],
    ['Cinnabon Living World Alam Sutera - Jl. Alam Sutera Boulevard No.Kav. 21, Pakulonan, Kec. Serpong Utara, Tangerang, Banten 15325', -6.244746866853201, 106.65286467054547, 6],
    ['Cinnabon MKG 2 - Jl. Boulevard Raya No.1, East Kelapa Gading, Kelapa Gading, North Jakarta City, Jakarta 14240', -6.157007199999992, 106.90815789999323, 7],
    ['Cinnabon Terminal 2D Bandara Soekarno Hatta - Bandar Udara Internasional Soekarno–Hatta, Terminal 2, Pajang, Kec. Benda, Kota Tangerang, Banten 15126', -6.122038566728071, 106.65248927054547, 8]
      ];-6.244745533706417, 106.65286467054547
  
      var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 11,
        center: new google.maps.LatLng(-6.200000, 106.816666),
        mapTypeId: google.maps.MapTypeId.ROADMAP
      });
  
      var infowindow = new google.maps.InfoWindow();
  
      var marker, i;
  
      for (i = 0; i < locations.length; i++) {  
        marker = new google.maps.Marker({
          position: new google.maps.LatLng(locations[i][1], locations[i][2]),
          map: map
        });
  
        google.maps.event.addListener(marker, 'click', (function(marker, i) {
          return function() {
            infowindow.setContent(locations[i][0]);
            infowindow.open(map, marker);
          }
        })(marker, i));
      }