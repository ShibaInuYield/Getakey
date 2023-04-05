import React from 'react';

const Rental = (props) => {
  return (
    <div className="rental">
      <img src={props.imageSrc} alt={props.title} className="rentalImg" />
      <h2>{props.title}</h2>
      <p>{props.description}</p>
      <p>{props.description}</p>
      <p>{props.description}</p>
    </div>
  );
};

export default Rental;