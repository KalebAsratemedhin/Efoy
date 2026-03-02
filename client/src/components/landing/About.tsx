
const About = () => {
  return (
    <div className="h-full">
      <div className="text-center py-24">
        <h1 className="text-primary mb-4 text-5xl font-bold">About Efoy</h1>
        <h2 className="text-xl">
          We are committed to providing excellent healthcare services at your fingertips.
        </h2>
      </div>

      <div className="bg-white py-16 px-4 flex gap-2">
        <div className="w-1/3 overflow-hidden h-72">
          <img src="/about-us.jpg" alt="about us" />
        </div>
        <div className="w-2/3">
          <h2 className="text-secondary text-xl">Who We Are</h2>
          <p className="text-gray-600">
            Efoy is a leading hospital appointment management platform designed to make healthcare more accessible and convenient. We connect patients with the best doctors across various specialties, ensuring seamless booking, management, and tracking of appointments.
          </p>

          <h2 className="text-secondary text-xl mt-5">Our Mission</h2>

          <p className="text-gray-600 ">
            Our mission is to simplify the process of managing healthcare appointments, allowing patients to focus on their health while we handle the logistics. With Efoy, you can trust that your healthcare needs are in good hands.
          </p>
        </div>
      </div>

      <section className="bg-primary text-white py-20">
        <div className="container mx-auto text-center">
          <h3 className="text-4xl font-bold mb-6">Join Us on Our Journey</h3>
          <p className="text-xl mb-6">
            Be a part of our community and experience the future of healthcare.
          </p>
          <button className="px-8 py-4 bg-white text-primary text-xl rounded-md font-semibold">
            Learn More
          </button>
        </div>
      </section>
    </div>
  );
};

export default About;
