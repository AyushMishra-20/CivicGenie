// In-memory storage for demo
let complaints = [];

exports.handler = async (event, context) => {
  const { method, path } = event;
  const body = JSON.parse(event.body || '{}');

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  if (method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Get all complaints
    if (method === 'GET' && path.includes('/complaints')) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(complaints)
      };
    }

    // Submit new complaint
    if (method === 'POST' && path.includes('/complaints')) {
      const complaint = {
        id: Date.now().toString(),
        ...body,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      complaints.push(complaint);
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          message: 'Complaint submitted successfully',
          complaint
        })
      };
    }

    // Update complaint status
    if (method === 'PUT' && path.includes('/complaints/')) {
      const complaintId = path.split('/').pop();
      const complaintIndex = complaints.findIndex(c => c.id === complaintId);
      
      if (complaintIndex === -1) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Complaint not found' })
        };
      }

      complaints[complaintIndex] = {
        ...complaints[complaintIndex],
        ...body,
        updatedAt: new Date().toISOString()
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'Complaint updated successfully',
          complaint: complaints[complaintIndex]
        })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Endpoint not found' })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
