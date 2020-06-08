require 'calabash-android/calabash_steps'
require 'json'

Then(/^I scroll view "([^"]*)" "([^"]*)"$/) do |view,direction|
    scroll("#{view}",:"#{direction}")
end


Then(/^I scroll "([^"]*)" until I see "([^"]*)"$/) do |direction, id|
    q = query("* marked:'#{id}'")
    while q.empty?
      if direction == 'right'
        perform_action('drag',50,30,50,50,1)
      elsif direction == 'left'
        perform_action('drag',50,30,50,50,1)
      elsif direction == 'down'
        perform_action('drag',20,20,20,5,1)
      elsif direction == 'up'
        perform_action('drag',50,50,30,50,1)
      end
      q = query("* marked:'#{id}'")
    end
  end

Then (/^I fill fields to create an user$/) do
    #Headers
    uri = URI('https://my.api.mockaroo.com/habiticacreateuser.json?key=42393010')
    res = Net::HTTP.get_response(uri)
    res['Set-Cookie']            # => String
    res.get_fields('set-cookie') # => Array
    res.to_hash['set-cookie']    # => Array
    #puts "Headers: #{res.to_hash.inspect}"
    
    # Status
    puts res.code       # => '200'
    #puts res.message    # => 'OK'
    #puts res.class.name # => 'HTTPOK'
    
    # Body
    puts res.body
    #puts res.body.user
    #puts res.body.password

    json = JSON.parse(res.body)
    puts json['user'] # prints "bar"

    enter_text("android.widget.EditText id:'#{"username"}'", json['user'])
    enter_text("android.widget.EditText id:'#{"email"}'", json['email'])
    enter_text("android.widget.EditText id:'#{"password"}'", json['password'])
    enter_text("android.widget.EditText id:'#{"confirm_password"}'", json['password'])
  end

  