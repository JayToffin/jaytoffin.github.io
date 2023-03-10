<!DOCTYPE html>
<html>

<head>
    <!-- Mobile Specific Meta -->
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <!-- Favicon-->
    <link rel="shortcut icon" href="asset/image/fav.png">
    <!-- Author Meta -->
    <meta name="author" content="Smeg">
    <!-- Meta Description -->
    <meta name="description" content="Smeg Indonesia">
    <!-- Meta Keyword -->
    <meta name="keywords" content="Smeg, Smeg Indonesia">
    <!-- meta character set -->
    <meta charset="UTF-8">
    <meta name="thumbnail" content="asset/image/og-image.jpg" />
    <meta property="og:url" content="index.html">
    <meta property="og:type" content="website">
    <meta property="og:title" content="SMEG Technology with style">
    <meta property="og:image" content="asset/image/og-image5e1f.jpg?v=2">
    <!-- <meta property="og:image:url" itemprop="image" content="http://www.smeg.co.th/asset/image/og-image.jpg" />
	<meta property="og:image:type" content="asset/image/jpeg" /> -->
    <meta property="og:description" content="Smeg Indonesia">
    <title> SMEG Technology with style</title>
    <!-- CSS -->
    <link rel="stylesheet" href="asset/css/custom.css">
    <link rel="stylesheet" href="asset/css/bootstrap.css">
    <link rel="stylesheet" href="asset/css/style.css">
    <link rel="stylesheet" href="asset/select2/css/select2.min.css">
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.2.0/css/all.css" crossorigin="anonymous">
    <link href="http://www.jqueryscript.net/css/jquerysctipttop.css" rel="stylesheet" type="text/css">
    <link href="asset/lib/zoomer/jquery.spzoom.css" rel="stylesheet" type="text/css">
    <link href="asset/lib/slick/slick.css" rel="stylesheet" type="text/css">
    <link href="asset/lib/slick/slick-theme.css" rel="stylesheet" type="text/css">
</head>

<body>
    <header>
    <section>
    <div class="container-fluid header navbar-fixed-top text-center">
      <div class="row sethighmenu d-none d-md-none d-lg-flex">
        <div class="col-lg-3" style="height: 40px;">
          <span class="float-left" id="opennav">
            <div id="nav-icon1">
              <span id='hamone'></span>
              <span id="cen"></span>
              <span id='hamthree'></span>
            </div>
          </span>
        </div>
        <div class="col-lg-6 text-center">
          <a href="index.php" class="setpointer" id='logo'>
            <img src="asset/image/logo-white.png" width="200">
          </a>
        </div>
      </div>
      <div class="row sethighmenu d-flex d-md-flex d-lg-none mobile">
        <div class="col-lg-12 sethighmenu ">
          <span class="float-left" id="opennavmobile">
            <div id="nav-icon1">
              <span id='hamone'></span>
              <span id="cen"></span>
              <span id='hamthree'></span>
            </div>
          </span>

          <a href="index.php" class="setpointer" id='logo'>
            <img src="asset/image/logo-white.png" width="200">
          </a>

          </div>
      </div>
      
      <div id="mySidenav" class="sidenav">
        <a href="javascript:void(0)" class="closebtn" id="closenav">&times;</a>
       
        <br>
        <br>
        <a href="index.php" class="forcenowrap text-left mgl-80"><span class="setbordermenu">Ho</span>me</a>
        <a href="about.php" class="forcenowrap text-left mgl-80"><span class="setbordermenu">Ab</span>out Smeg</a>
        <a href="catalog.php" class="forcenowrap text-left mgl-80"><span class="setbordermenu">Ca</span>talog</a>
        <a href="news.php" class="forcenowrap text-left mgl-80"><span class="setbordermenu">Ne</span>ws & Event</a>

      </div>
    </div>
  </section>

  <!-- Sticky menu desktop -->
  <div class="sticky d-none d-sm-none d-md-block">
    <a href="index.php">
      <div class="stickyitem" style="background-color: #FFFFFF">
        <img class="stickyicon" src="asset/image/sticky/home.png" alt="Home">
        <span style="color:#000000;font-size: 14px;">Home</span>
      </div>
    </a>
    <a href="contact.php">
      <div class="stickyitem" style="background-color: #FFFFFF">
        <img class="stickyicon" src="asset/image/sticky/location.png" alt="Store">
        <span style="color:#000000;font-size: 14px;">Store</span>
      </div>
    </a>
    <a href="catalog.php">
      <div class="stickyitem" style="background-color: #FFFFFF">
        <img class="stickyicon" src="asset/image/sticky/brochure.png" alt="Catalog">
        <span style="color:#000000;font-size: 14px;">Catalog</span>
      </div>
    </a>
  </div>
  <!-- Sticky menu desktop -->

  <!-- Sticky menu mobile -->
  <div class="sticky-mo d-block d-sm-block d-md-none d-lg-none d-xl-none" style="opacity: 0;">

    <a class="stk" href="index.php">
      <div class="stickyitem-mo text-center" style="background-color: #FFFFFF">
        <img class="stickyicon-mo" src="asset/image/sticky/home.png" alt="Home">
        <!-- <p class="text-center" style="color:#000000;">Home</p> -->
      </div>
      <p class="stickytxt-mo text-center" style="background-color: #FFFFFF;color:#000000;">Home</p>
    </a>
    <a class="stk" href="news.php">
      <div class="stickyitem-mo text-center" style="background-color: #FFFFFF">
        <img class="stickyicon-mo" src="asset/image/sticky/news.png" alt="Product">
        <!-- <p class="text-center" style="color:#000000;">Product</p> -->
      </div>
      <p class="stickytxt-mo text-center" style="background-color: #FFFFFF;color:#000000;">News</p>
    </a>
    <a class="stk" href="contact.php">
      <div class="stickyitem-mo text-center" style="background-color: #FFFFFF">
        <img class="stickyicon-mo" src="asset/image/sticky/location.png" alt="Store">
        <!-- <p class="text-center" style="color:#000000;">Store</p> -->
      </div>
      <p class="stickytxt-mo text-center" style="background-color: #FFFFFF;color:#000000;">Store</p>
    </a>
    <a class="stk" href="catalog.php">
      <div class="stickyitem-mo text-center" style="background-color: #FFFFFF">
        <img class="stickyicon-mo" src="asset/image/sticky/brochure.png" alt="Catalog">
        <!-- <p class="text-center" style="color:#000000;">Catalog</p> -->
      </div>
      <p class="stickytxt-mo text-center" style="background-color: #FFFFFF;color:#000000;">Catalog</p>
    </a>
    <a class="stk" href="#">
      <div class="stickyitem-mo text-center" style="background-color: #FFFFFF">
        <img class="stickyicon-mo" src="asset/image/sticky/whatsapp.png" alt="Chat">
        <!-- <p class="text-center" style="color:#000000;">Chat</p> -->
      </div>
      <p class="stickytxt-mo text-center" style="background-color: #FFFFFF;color:#000000;">Chat</p>
    </a>
  </div>
  <!-- Sticky menu mobile -->
    </header>