import requests
import csv

def register(data):
    url = 'http://localhost:2000/csv_register'

    x = requests.post(url, data = data)

    #print(x.text)


with open('users.csv') as file:
    read=csv.reader(file,delimiter=',')
    curr=1
    for row in read:
        data={'name':row[0],'rollno':row[1],'username':row[2],'password':row[3],'email':row[4], 'role':row[5],'code':'lkshdfiohnaklsdnka'}
        curr+=1;
        print(data)
        register(data)
        print("registered User"+str(curr) )
