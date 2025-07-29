function initMap() {
    var center = { lat: 0, lng: 0 }; // Pusat peta di tengah dunia
    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 2,
      center: center
    });
  
    var locations = [
      // Daftar koordinat untuk lokasi di seluruh dunia
      { lat: 45.43639819999799, lng: 9.349993470552295 }, // Milan
      { lat: -6.200000, lng: 106.816666 }, // Indonesia
      { lat: 14.0583, lng: 108.2772 }, // Vietnam
      { lat: 28.3949, lng: 84.1240 }, // Nepal
      { lat: -30.5595, lng: 22.9375 }, // South Africa
      { lat: 39.0742, lng: 21.8243 }, // Greece
      { lat: 35.1264, lng: 33.4299 }, // Cyprus
      { lat: 38.9637, lng: 35.2433 }, // Turkey
      { lat: 48.0196, lng: 66.9237 }, // Kazakhstan
      { lat: 23.6345, lng: -102.5528 }, // Mexico
      { lat: -9.1900, lng: -75.0152 }, // Peru
      { lat: -35.6751, lng: -71.5430 }, // Chile
      { lat: 55.3781, lng: -3.4360 }, // UK
      { lat: 23.8859, lng: 45.0792 }, // Saudi Arabia
      { lat: 46.8182, lng: 8.2275 }  // Switzerland
      // Tambahkan lebih banyak koordinat di sini
    ];
  
    var markers = locations.map(function(location) {
      return new google.maps.Marker({
        position: location,
        map: map
      });
    });
  
      // Membuat objek LatLngBounds untuk menyesuaikan tampilan peta
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < locations.length; i++) {
      bounds.extend(locations[i]);
    }
  
    // Menyesuaikan tampilan peta agar mencakup semua marker
    map.fitBounds(bounds);
  
    // Opsional: Mencegah zoom terlalu dekat pada tampilan mobile
    var listener = google.maps.event.addListener(map, "idle", function() {
      if (map.getZoom() > 16) map.setZoom(16);
      google.maps.event.removeListener(listener);
    });
  }