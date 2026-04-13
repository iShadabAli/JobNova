import React, { useState } from 'react';

const StarRating = ({ rating, onChange, readOnly = false, size = '24px' }) => {
    const [hover, setHover] = useState(0);

    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;

                return (
                    <label key={index} style={{ cursor: readOnly ? 'default' : 'pointer' }}>
                        {!readOnly && (
                            <input
                                type="radio"
                                name="rating"
                                value={ratingValue}
                                onClick={() => onChange(ratingValue)}
                                style={{ display: 'none' }}
                            />
                        )}
                        <span
                            onMouseEnter={() => !readOnly && setHover(ratingValue)}
                            onMouseLeave={() => !readOnly && setHover(0)}
                            style={{
                                color: ratingValue <= (hover || rating) ? '#fbbf24' : '#e5e7eb', // Yellow-400 : Gray-200
                                fontSize: size,
                                transition: 'color 0.2s'
                            }}
                        >
                            ★
                        </span>
                    </label>
                );
            })}
        </div>
    );
};

export default StarRating;
