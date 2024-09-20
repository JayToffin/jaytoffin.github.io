//TABS
$(document).ready(function(){

    $('[data-group]').each(function(){
      var $allClick = $(this).find('[data-click]'),
          $allTarget = $(this).find('[data-target]'),
          activeClass = 'active';
  
      $allTarget.first().addClass(activeClass);
      $allClick.first().addClass(activeClass);
  
      $allClick.click(function(e){
        e.preventDefault();
  
        var tabName = $(this).data('click'),
            $target = $('[data-target="' + tabName + '"]');
  
            $allClick.removeClass(activeClass);
            $allTarget.removeClass(activeClass);
  
            $target.addClass(activeClass);
            $(this).addClass(activeClass);
      });
  
    });
    
  });