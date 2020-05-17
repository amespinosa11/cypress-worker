require 'calabash-android/calabash_steps'

Then(/^I scroll view "([^"]*)" "([^"]*)"$/) do |view,direction|
    scroll("#{view}",:"#{direction}")
end

Then /^I scroll down$/ do
    scroll_down
end

