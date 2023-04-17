from flask import (Flask, render_template, request,
                   send_from_directory, abort)
from flask import Flask, render_template, request, redirect, url_for
import requests
import json

app = Flask(__name__)


@app.route('/')
def homepage():
    return render_template('index.html')


@app.errorhandler(404)
def page_not_found(error):
    return render_template('404.html', title='404'), 404


@app.route('/<state_code>', methods=['GET', 'POST'])
def index(state_code):
    state_code_dict = {
        'AN': 'Andaman and Nicobar', 'AP': 'Andhra Pradesh', 'AR': 'Arunachal Pradesh', 'AS': 'Assam', 'BR': 'Bihar', 'TT': 'Total',
        'CH': 'Chandigarh', 'CT': 'Chattisgarh', 'DL': 'Delhi', 'DN': 'Dadra and Nagar Haveli', 'GA': 'Goa', 'GJ': 'Gujarat',
        'HP': 'Himachal Pradesh', 'HR': 'Haryana', 'JH': 'Jharkhand', 'JK': 'Jammu and Kashmir', 'KA': 'Karnataka', 'KL': 'Kerala',
        'LA': 'Ladakh', 'LD': 'Lakshadweep', 'MH': 'Maharashtra', 'ML': 'Meghalaya', 'MN': 'Manipur', 'MP': 'Madhya Pradesh',
        'MZ': 'Mizoram', 'NL': 'Nagaland', 'OR': 'Odisha', 'PB': 'Punjab', 'PY': 'Puducherry', 'RJ': 'Rajasthan', 'SK': 'Sikkim',
        'TG': 'Telangana', 'TN': 'Tamil Nadu', 'TR': 'Tripura', 'UP': 'Uttar Pradesh', 'UT': 'Uttarakhand', 'WB': 'West Bengal'
    }
    if state_code not in state_code_dict:
        abort(404)
    return render_template('state_data.html', state=state_code_dict[state_code], state_id=state_code)


@app.route('/show_graphs/<state_code>')
def show_graphs(state_code):
    state_code_dict = {
        'AN': 'Andaman and Nicobar', 'AP': 'Andhra Pradesh', 'AR': 'Arunachal Pradesh', 'AS': 'Assam', 'BR': 'Bihar', 'TT': 'Total',
        'CH': 'Chandigarh', 'CT': 'Chattisgarh', 'DL': 'Delhi', 'DN': 'Dadra and Nagar Haveli', 'GA': 'Goa', 'GJ': 'Gujarat',
        'HP': 'Himachal Pradesh', 'HR': 'Haryana', 'JH': 'Jharkhand', 'JK': 'Jammu and Kashmir', 'KA': 'Karnataka', 'KL': 'Kerala',
        'LA': 'Ladakh', 'LD': 'Lakshadweep', 'MH': 'Maharashtra', 'ML': 'Meghalaya', 'MN': 'Manipur', 'MP': 'Madhya Pradesh',
        'MZ': 'Mizoram', 'NL': 'Nagaland', 'OR': 'Odisha', 'PB': 'Punjab', 'PY': 'Puducherry', 'RJ': 'Rajasthan', 'SK': 'Sikkim',
        'TG': 'Telangana', 'TN': 'Tamil Nadu', 'TR': 'Tripura', 'UP': 'Uttar Pradesh', 'UT': 'Uttarakhand', 'WB': 'West Bengal'
    }
    if state_code not in state_code_dict:
        abort(404)
    return render_template('show_graph.html', state_id=state_code)


# @app.route('/vaccination_center')
# def vaccination_center_search():
#     return render_template('vaccination.html')

@app.route('/pincode', methods=['GET', 'POST'])
def pincode_page():
    if request.method == 'POST':
        pincode = request.form['pincode']
        return redirect(url_for('get_vaccine_centers', pincode=pincode))
    else:
        return render_template('pincode.html')

@app.route('/vaccine_centers')
def get_vaccine_centers():
    pincode = request.args.get('pincode')

    # Make a GET request to the API endpoint
    url = f"https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByPin?pincode={pincode}&date=2023-04-17"
    response = requests.get(url)

    # Parse the JSON response
    data = json.loads(response.text)

    # Extract the list of centers and render the HTML template
    centers = data['sessions']
    return render_template('vaccine_centers.html', pincode=pincode, centers=centers)

@app.route('/book_appointment/<center_id>', methods=['GET', 'POST'])
def book_appointment(center_id):
    if request.method == 'POST':
        name = request.form['name']
        age = request.form['age']
        email = request.form['email']
        dose = request.form['dose']
        date = request.form['date']
        slot = request.form['slot']

        # Make a POST request to the API endpoint to book the appointment
        url = 'https://cdn-api.co-vin.in/api/v2/appointment/schedule'
        headers = {'Content-Type': 'application/json'}
        data = {
            'center_id': center_id,
            'session_id': slot,
            'beneficiaries': [{
                'name': name,
                'age': age,
                'email': email,
                'dose': dose,
            }],
        }
        response = requests.post(url, headers=headers, data=json.dumps(data))

        # Check the status code of the response and display an appropriate message
        if response.status_code == 200:
            flash('Appointment booked successfully!', 'success')
        else:
            flash('Failed to book appointment. Please try again later.', 'error')

        return redirect(url_for('get_vaccine_centers', pincode=request.args.get('pincode')))
    else:
        slot = request.args.get('slot')
        return render_template('book_appointment.html', center_id=center_id, slot=slot)



@app.route('/robots.txt')
@app.route('/sitemap.xml')
def static_from_root():
    return send_from_directory(app.static_folder, request.path[1:])


if __name__ == '__main__':
    app.run()
