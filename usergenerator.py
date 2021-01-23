import csv
fields = ['name', 'rollno', 'username', 'password', 'email', 'role']
filename = "users.csv"

with open(filename, 'w', newline='') as csvfile:
    writer = csv.DictWriter(csvfile, fieldnames = fields)
    writer.writeheader()
    for i in range(1,1000):
        mydict = {"name":"user "+str(i), "rollno":i, "username":"user"+str(i), "password":"user"+str(i), "email":"user"+str(i)+"@user.com", "role":"Student"}
        writer.writerow(mydict)
        print(mydict)
