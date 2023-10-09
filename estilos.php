<!DOCTYPE html>
<html lang="en" dir="ltr">

<head>
    <meta charset="utf-8">
    <title></title>
</head>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
    href="https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap"
    rel="stylesheet" />
<style media="screen">
    * {
        font-family: 'Public Sans', sans-serif;
    }

    h1 {
        color: #CC7722;
    }

    table {
        border-radius: 15px;
        padding: 5px;
        text-transform: uppercase;
        font-size: 0.85rem;
    }


    thead,
    tbody,
    tfoot,
    tr,
    td,
    th {
        /* border-color: inherit;
        border-style: solid;
        border-width: 0; */
        background-color: none;
        padding: 8px;
    }


    thead {
        color: #fff;
        /* background-color: rgba(67, 89, 113, 0.6); */
        background-color: #CC7722;
        border-radius: 15px;

    }

    td {
        text-align: center;
    }

    tr th:first-child {
        border-radius: 10px 0px 0px 0px;
    }

    tr th:last-child {
        border-radius: 0px 10px 0px 0px;
    }

    .btn {
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }



    .btn {
        --bs-btn-padding-x: 1.25rem;
        --bs-btn-padding-y: 0.4375rem;
        --bs-btn-font-family: ;
        --bs-btn-font-size: 0.9375rem;
        --bs-btn-font-weight: 400;
        --bs-btn-line-height: 1.53;
        --bs-btn-color: #697a8d;
        --bs-btn-bg: transparent;
        --bs-btn-border-width: 1px;
        --bs-btn-border-color: transparent;
        --bs-btn-border-radius: 0.375rem;
        --bs-btn-hover-border-color: transparent;
        --bs-btn-box-shadow: none;
        --bs-btn-disabled-opacity: 0.65;
        --bs-btn-focus-box-shadow: 0 0 0 0.05rem rgba(var(--bs-btn-focus-shadow-rgb), .5);
        display: inline-block;
        padding: var(--bs-btn-padding-y) var(--bs-btn-padding-x);
        font-family: var(--bs-btn-font-family);
        font-size: var(--bs-btn-font-size);
        font-weight: var(--bs-btn-font-weight);
        line-height: var(--bs-btn-line-height);
        color: var(--bs-btn-color);
        text-align: center;
        vertical-align: middle;
        cursor: pointer;
        user-select: none;
        border: var(--bs-btn-border-width) solid var(--bs-btn-border-color);
        border-radius: var(--bs-btn-border-radius);
        background-color: var(--bs-btn-bg);
        transition: all 0.2s ease-in-out;
    }

    .btn-gris {
        color: #fff;
        background-color: #8592a3;
        border-color: #8592a3;
        box-shadow: 0 0.125rem 0.25rem 0 rgba(133, 146, 163, 0.4);
    }

    .btn-gris:hover {
        color: #fff !important;
        background-color: #788393 !important;
        border-color: #788393 !important;
        transform: translateY(-1px) !important;
    }


    .btn-naranja {
        color: #fff;
        background-color: #CC7722;
        border-color: #CC7722;
        box-shadow: 0 0.125rem 0.25rem 0 rgba(133, 146, 163, 0.4);
    }

    .btn-naranja:hover {
        color: #fff !important;
        background-color: #E19549 !important;
        border-color: #E19549 !important;
        transform: translateY(-1px) !important;
    }
</style>

<body>


    <h1>Estadística</h1>

    <table padding="5px" cellspacing="0px">
        <thead>
            <tr>
                <th>ID</th>
                <th>LUMINARIA</th>
                <th>POSTE</th>
                <th>TECNOLOGIA</th>
                <th>Capacidad</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>1</td>
                <td>0</td>
                <td>0</td>
                <td>LED</td>
                <td>Sin Fotocelda</td>
            </tr>
            <tr>
                <td>2</td>
                <td>0</td>
                <td>0</td>
                <td>LED</td>
                <td>Sin Fotocelda</td>
            </tr>
            <tr>
                <td>3</td>
                <td>0</td>
                <td>0</td>
                <td>LED</td>
                <td>Sin Fotocelda</td>
            </tr>
        </tbody>
    </table>


    <button type="button" class="btn btn-gris" name="button">Boton gris</button>

    <button type="button" class="btn btn-naranja" name="button">Boton naranja</button>

</body>

</html>