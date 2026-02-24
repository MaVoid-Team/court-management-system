puts "Seeding database..."

branch1 = Branch.create!(
  name: "Downtown Sports Center",
  address: "123 Main Street, Downtown",
  timezone: "Africa/Cairo",
  active: true
)

branch2 = Branch.create!(
  name: "Uptown Athletic Club",
  address: "456 Park Avenue, Uptown",
  timezone: "Africa/Cairo",
  active: true
)

Setting.create!(
  branch: branch1,
  whatsapp_number: "201234567890",
  contact_email: "downtown@courtmgmt.com",
  contact_phone: "+20-123-456-7890"
)

Setting.create!(
  branch: branch2,
  whatsapp_number: "209876543210",
  contact_email: "uptown@courtmgmt.com",
  contact_phone: "+20-987-654-3210"
)

super_admin = Admin.create!(
  email: "superadmin@courtmgmt.com",
  password: "password123",
  password_confirmation: "password123",
  role: :super_admin,
  branch: nil
)

branch_admin1 = Admin.create!(
  email: "admin.downtown@courtmgmt.com",
  password: "password123",
  password_confirmation: "password123",
  role: :branch_admin,
  branch: branch1
)

branch_admin2 = Admin.create!(
  email: "admin.uptown@courtmgmt.com",
  password: "password123",
  password_confirmation: "password123",
  role: :branch_admin,
  branch: branch2
)

court1a = Court.create!(branch: branch1, name: "Court A", price_per_hour: 150.00, active: true)
court1b = Court.create!(branch: branch1, name: "Court B", price_per_hour: 200.00, active: true)
court2a = Court.create!(branch: branch2, name: "Court Alpha", price_per_hour: 175.00, active: true)
court2b = Court.create!(branch: branch2, name: "Court Beta", price_per_hour: 225.00, active: true)

Package.create!(branch: nil, title: "Starter Pack", description: "10 hours of court time", price: 1200.00)
Package.create!(branch: branch1, title: "Downtown Monthly", description: "Unlimited play for one month", price: 3000.00)
Package.create!(branch: branch2, title: "Uptown Weekend Pass", description: "Weekend access for a month", price: 1800.00)

Event.create!(
  branch: branch1,
  title: "Summer Padel Tournament",
  description: "Annual summer tournament with prizes",
  start_date: 1.month.from_now,
  participation_price: 250.00,
  max_participants: 32
)

Event.create!(
  branch: branch2,
  title: "Beginners Workshop",
  description: "Learn the basics of padel in a fun environment",
  start_date: 2.weeks.from_now,
  participation_price: 100.00,
  max_participants: 16
)

tomorrow = Date.tomorrow
Booking.create!(
  branch: branch1,
  court: court1a,
  user_name: "Ahmed Hassan",
  user_phone: "+201001234567",
  date: tomorrow,
  start_time: "10:00",
  end_time: "11:00",
  hours: 1,
  total_price: 150.00,
  status: :confirmed,
  payment_status: :paid
)

Booking.create!(
  branch: branch1,
  court: court1a,
  user_name: "Mohamed Ali",
  user_phone: "+201009876543",
  date: tomorrow,
  start_time: "14:00",
  end_time: "16:00",
  hours: 2,
  total_price: 300.00,
  status: :confirmed,
  payment_status: :pending
)

BlockedSlot.create!(
  branch: branch1,
  court: court1b,
  date: tomorrow,
  start_time: "08:00",
  end_time: "10:00",
  reason: "Maintenance"
)

puts "Seeding complete!"
puts "  Branches: #{Branch.count}"
puts "  Admins: #{Admin.count}"
puts "  Courts: #{Court.count}"
puts "  Packages: #{Package.count}"
puts "  Events: #{Event.count}"
puts "  Bookings: #{Booking.count}"
puts "  Blocked Slots: #{BlockedSlot.count}"
puts ""
puts "Super Admin: superadmin@courtmgmt.com / password123"
puts "Branch Admin 1: admin.downtown@courtmgmt.com / password123"
puts "Branch Admin 2: admin.uptown@courtmgmt.com / password123"
