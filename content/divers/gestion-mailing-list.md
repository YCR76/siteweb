---
title: "Gestion mailing list"
date: 2015-04-17 11:21:00
aliases:
  - /gestion-mailing-list
---
php
try {
require\_once("./ycr76/OvhApi.php");
/\*\*
\* Instanciate an OVH Client.
\* You can generate new credentials with full access to your account on
\* the token creation page
\*/
$ovh = new OvhApi(); // Consumer Key
if ( isset($\_REQUEST["ml"]) )
{
if ( isset($\_REQUEST["add"]) )
{
$mailre='/[[:alnum:][:punct:]]{1,64}@[[:alnum:][:punct:].]{2,253}\.[[:alpha:].]{2,6}/';
if ( preg\_match\_all($mailre, $\_REQUEST["email"], $matches) !== false )
{
foreach ($matches[0] as $email)
{
$email = str\_replace("mailto:", "", $email);
if ( trim ($email) != "" )
{
$result = $ovh-post('/email/domain/ycr76.fr/mailingList/'.$\_REQUEST["ml"].'/subscriber', array('email' => trim ($email)));
echo "Email en cours d'ajout : ".trim ($email).".
\n";
}
}
}
}
if ( isset($\_REQUEST["maxdel"]) )
{
for ($count = 0; $count <= $\_REQUEST["maxdel"]; $count++)
{
if ( isset($\_REQUEST["del".$count]) )
{
$result = $ovh->delete('/email/domain/ycr76.fr/mailingList/'.$\_REQUEST["ml"].'/subscriber/'.$\_REQUEST["del".$count]);
}
}
}
}
?>
<form method="post" enctype="multipart/form-data">

	<p>

	List : <select name="ml" onchange="submit();">

	<option value=''></option>

	<?php

	$result = $ovh->get('/email/domain/ycr76.fr/mailingList');

	sort($result);

	foreach ($result as $ml)

	{

		echo "<option value='".$ml."'";

		if ( isset($_REQUEST["ml"]) && $_REQUEST["ml"] == $ml )

			echo " SELECTED";

		echo ">".$ml."</option>";

	}

	?>

	</select>

	<?php

	if ( isset($_REQUEST["ml"]) )

	{

		?>

		<br>

		Emails :<br><textarea rows="4" cols="100" name="email"></textarea><br>

		<input type="submit" name="add" value="Ajouter">

		<p>

		<?php

		$result = $ovh->get('/email/domain/ycr76.fr/mailingList/'.$_REQUEST["ml"].'/subscriber');

		$count = 0;

		$find = false;

		sort($result);

		echo "Mailin list de ".count($result)." adresses.<br>";

		foreach ($result as $account)

		{

			echo "<input type='checkbox' name='del".$count."' value='".$account."'> ".$account."<br>";

			$count++;

			$find = true;

		}

		if ( $find )

		{

			echo "<input type='hidden' name='maxdel' value='".$count."'>";

			echo '<input type="submit" name="del" value="Del">';

		}

	}

	?>

	</form>
php
} catch (Exception $e) {
print\_r($e);
} catch (Error $e) {
print\_r($e);
}
?
