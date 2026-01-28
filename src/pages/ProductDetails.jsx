import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchProductById } from "../api/publicAPI";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetchProductById(id).then(setProduct);
  }, [id]);

  if (!product) return <p>Loading...</p>;

  return (
    <div style={{ padding: 40 }}>
      <h1>{product.name}</h1>
      <img src={product.image_url} alt={product.name} width="300" />
      <p>{product.description}</p>
      <h3>₹{product.price}</h3>

      <button onClick={() => navigate(`/order/${product.id}`)}>
        Buy Now
      </button>
    </div>
  );
}

export default ProductDetails;
