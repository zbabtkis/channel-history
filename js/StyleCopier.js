/**
 * Utility function top copy rules from all stylesheets to another document
 * 
 * @author  Zachary Babtkis <zackbabtkis@gmail.com>
 * @date    December 4th 2013
 * @License WTFPL
 */

/**
 * copy styles
 * 
 * @param {DOM} source Source document to copy from.
 * @param {DOM} target Document to copy rules to.
 *
 * @return {Style Element} Style element if no target given.
 */
var copyStyles = function(source, target) {
  var sheets = source.styleSheets
    , styles = document.createElement('style');
  
  // Loop through all stylesheets in source document head.
  for(var i = 0; i < sheets.length; i++) {
    // Sheet might not contain any rules...
    if(sheets[i].rules) {
      // Add every rule from current stylesheet to styles element as text node.
      for(var j = 0; j < sheets[i].rules.length; j++) {
        styles.appendChild(document.createTextNode(sheets[i].rules[j].cssText));
      }
    }
  }
  
  if(target) {
    // Appends style element to head of target document.
    target.head.appendChild(styles);
  }
  
  return styles;
};