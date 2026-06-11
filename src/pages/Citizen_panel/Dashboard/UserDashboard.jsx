const fetchComplaints = useCallback(async () => {
  try {
    setComplaintLoading(true);
    setComplaintError(null);

    console.log("TOKEN:", localStorage.getItem("token"));

    const response = await api.get("/api/citizen/complaints");

    console.log("STATUS:", response.status);
    console.log("DATA:", response.data);

    setComplaints(
      Array.isArray(response.data) ? response.data : []
    );

  } catch (error) {

    console.log("ERROR STATUS:", error?.response?.status);
    console.log("ERROR DATA:", error?.response?.data);
    console.log("FULL ERROR:", error);

    if (error?.response?.status !== 401) {
      setComplaintError("Failed to load complaints. Please try again.");
    }

    setComplaints([]);

  } finally {
    setComplaintLoading(false);
  }
}, []);
